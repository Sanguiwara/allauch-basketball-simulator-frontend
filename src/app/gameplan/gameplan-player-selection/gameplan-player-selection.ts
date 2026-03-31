import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatExpansionModule} from '@angular/material/expansion';
import {catchError, finalize, of} from 'rxjs';

import {GamePlanApiService} from '../gameplan-service';
import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {InGamePlayer} from '../../models/ingameplayer.model';

type PlayerChoice = 'play' | 'noPlay';
type StarterChoice = 'starter' | 'bench';

@Component({
  selector: 'app-player-selection-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatRadioModule,
    MatButtonModule,
    RouterLink,
    MatSlider,
    MatSliderThumb,
    MatExpansionModule,
  ],
  templateUrl: './gameplan-player-selection.html',
  styleUrl: './gameplan-player-selection.scss',
})
export class GameplanPlayerSelectionComponent implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;
  @Output() activePlayersChange = new EventEmitter<InGamePlayer[]>();

  homePlayers: Player[] = [];
  choiceById = new Map<string, PlayerChoice>();
  starterChoiceById = new Map<string, StarterChoice>();
  sortMode: 'default' | 'overallDesc' | 'attackDesc' | 'defenseDesc' | 'playmakingDesc' | 'reboundDesc' | 'stealDesc' = 'default';

  readonly minMinutes = 0;
  readonly maxMinutes = 40;
  readonly totalMinutes = 200;

  minutesById = new Map<string, number>();
  totalSelectedMinutes = 0;
  remainingMinutes = this.totalMinutes;
  hasInvalidMinutes = false;
  canSave = false;
  isSaving = false;
  saveStatus: 'idle' | 'success' | 'error' = 'idle';

  readonly maxStarters = 5;

  constructor(private api: GamePlanApiService, private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.hydrateFromPlan();
    }
  }

  private hydrateFromPlan(): void {
    this.homePlayers = this.gamePlan.ownerTeam?.players ?? [];

    const activePlayers = this.gamePlan.activePlayers ?? [];
    const activeById = new Map(activePlayers.map(activePlayer => [activePlayer.player.id, activePlayer]));

    this.choiceById.clear();
    this.starterChoiceById.clear();
    this.minutesById.clear();


    for (const p of this.homePlayers) {
      let isInGamePlayer = false;

      if (activePlayers.length > 0) {
        isInGamePlayer = activePlayers.some(activePlayer => activePlayer.player.id === p.id);
      }

      // Play / bench
      if (isInGamePlayer) {
        this.choiceById.set(p.id, 'play');
        if (activeById.get(p.id)?.starter === true) {
          this.starterChoiceById.set(p.id, 'starter');
        } else {
          this.starterChoiceById.set(p.id, 'bench');
        }
        const minutes = activeById.get(p.id)?.minutesPlayed;
        this.minutesById.set(p.id, Number.isFinite(minutes) ? (minutes as number) : 0);
      }
      else {
        this.choiceById.set(p.id, 'noPlay');
      }

    }

    this.recalculateSummary();
    this.syncActivePlayers();
  }

  getChoice(playerId: string): PlayerChoice {
    return this.choiceById.get(playerId) ?? 'noPlay';
  }

  setChoice(playerId: string, choice: PlayerChoice): void {
    this.choiceById.set(playerId, choice);

    // Si Don't play => pas starter
    if (choice === 'noPlay') {
      this.starterChoiceById.delete(playerId);
    } else {
      // Par défaut quand on passe en play
      if (!this.starterChoiceById.has(playerId)) {
        this.starterChoiceById.set(playerId, 'bench');
      }
    }
    if (choice === 'noPlay') {
      this.minutesById.set(playerId, 0);
    } else if (!this.minutesById.has(playerId)) {
      this.minutesById.set(playerId, 0);
    }

    this.recalculateSummary();
    this.syncActivePlayers();
  }

  getStarterChoice(playerId: string): StarterChoice {
    return this.starterChoiceById.get(playerId) ?? 'bench';
  }

  private starterCount(excludePlayerId?: string): number {
    let count = 0;
    for (const [id, starterChoice] of this.starterChoiceById.entries()) {
      if (excludePlayerId && id === excludePlayerId) continue;
      if (this.getChoice(id) !== 'play') continue;
      if (starterChoice === 'starter') count++;
    }
    return count;
  }

  canSelectStarter(playerId: string): boolean {
    if (this.getChoice(playerId) !== 'play') return false;

    // S'il est déjà starter, on peut toujours le laisser
    if (this.getStarterChoice(playerId) === 'starter') return true;

    return this.starterCount() < this.maxStarters;
  }

  setStarterChoice(playerId: string, choice: StarterChoice): void {
    if (this.getChoice(playerId) !== 'play') return;

    this.starterChoiceById.set(playerId, choice);
    this.syncActivePlayers();

  }

  getMinutes(playerId: string): number {
    return this.minutesById.get(playerId) ?? 0;
  }

  setMinutes(playerId: string, value: number | null | undefined): void {
    if (this.getChoice(playerId) !== 'play') return;
    const minutes = Number(value);
    if (!Number.isFinite(minutes)) return;
    this.minutesById.set(playerId, minutes);
    this.minutesById = new Map(this.minutesById);

    this.recalculateSummary();
    this.syncActivePlayers();

    // ✅ sécurise l'UI (surtout sur certains PC)
    this.cdr.markForCheck();
  }
  isMinutesInvalid(playerId: string): boolean {
    if (this.getChoice(playerId) !== 'play') return false;
    return this.isMinutesValueInvalid(this.getMinutes(playerId));
  }

  private isMinutesValueInvalid(value: number): boolean {
    if (!Number.isInteger(value)) return true;
    return value < this.minMinutes || value > this.maxMinutes;
  }



  private defaultInGamePlayer(player: Player): InGamePlayer {
    return {
      player,
      starter: false,

      playmakingContribution: 0,
      assistWeight: 0,

      assists: 0,
      points: 0,

      fga: 0,
      fgm: 0,

      threePointAttempt: 0,
      threePointMade: 0,

      twoPointAttempts: 0,
      twoPointMade: 0,

      usageShoot: 0,
      usageDrive: 0,
      usagePost: 0,
      minutesPlayed: 0,
      threePtScore: 0,
      twoPtScore: 0,
      driveScore : 0,
      driveAttempts : 0,
      driveMade : 0
    };
  }

  get displayPlayers(): Player[] {
    if (this.sortMode === 'default') return this.homePlayers;

    const sorted = [...this.homePlayers];
    sorted.sort((a, b) => this.sortValue(b) - this.sortValue(a));
    return sorted;
  }

  setSortMode(mode: 'default' | 'overallDesc' | 'attackDesc' | 'defenseDesc' | 'playmakingDesc' | 'reboundDesc' | 'stealDesc'): void {
    this.sortMode = mode;
  }

  private avg(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  attackScore(p: Player): number {
    return this.avg([
      p.tir3Pts,
      p.tir2Pts,
      p.lancerFranc,
      p.floater,
      p.finitionAuCercle,
      p.ballhandling,
      p.passingSkills,
    ]);
  }

  defenseScore(p: Player): number {
    return this.avg([
      p.defExterieur,
      p.defPoste,
      p.protectionCercle,
      p.speed,
      p.solidite,
    ]);
  }

  stealScore(p: Player): number {
    return (
      p.speed * 0.20 +
      p.defExterieur * 0.25 +
      p.steal * 0.30 +
      p.basketballIqDef * 0.15 +
      p.endurance * 0.05 +
      p.physique * 0.05
    );
  }

  reboundScore(p: Player): number {
    return (
      p.size * 0.18 +
      p.weight * 0.10 +
      p.agressivite * 0.10 +
      p.agressiviteRebond * 0.18 +
      p.timingRebond * 0.18 +
      p.physique * 0.14 +
      p.iq * 0.06 +
      p.endurance * 0.06
    );
  }

  mentalScore(p: Player): number {
    const egoScore = 100 - p.ego;
    return this.avg([
      p.iq,
      p.basketballIqOff,
      p.basketballIqDef,
      p.leadership,
      p.coachability,
      p.softSkills,
      egoScore,
    ]);
  }

  playmakingScore(p: Player): number {
    return this.avg([p.passingSkills, p.iq, p.basketballIqOff, p.basketballIqDef]);
  }

  physScore(p: Player): number {
    return this.avg([p.physique, p.endurance, p.solidite, p.speed]);
  }

  overall(p: Player): number {
    const a = this.attackScore(p);
    const d = this.defenseScore(p);
    const m = this.mentalScore(p);
    const phys = this.physScore(p);
    return Math.round(a * 0.25 + d * 0.30 + m * 0.25 + phys * 0.20);
  }

  overviewStats(p: Player): {label: string; value: number}[] {
    return [
      {label: 'OVR', value: this.overall(p)},
      {label: 'ATT', value: this.attackScore(p)},
      {label: 'DEF', value: this.defenseScore(p)},
      {label: 'STL', value: Math.round(this.stealScore(p))},
      {label: 'REB', value: Math.round(this.reboundScore(p))},
      {label: 'PM', value: this.playmakingScore(p)},
    ];
  }

  saveActivePlayers(): void {
    if (!this.gamePlan || !this.canSave) return;

    console.log(this.starterChoiceById);
    this.isSaving = true;
    this.saveStatus = 'idle';
    this.cdr.markForCheck();
    this.gamePlan.activePlayers = this.buildActivePlayers();

    this.api.saveGamePlan(this.gamePlan).pipe(
      catchError(() => {
        this.saveStatus = 'error';
        this.cdr.markForCheck();
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        if (this.saveStatus !== 'error') {
          this.saveStatus = 'success';
        }
        this.cdr.markForCheck();
        setTimeout(() => {
          this.saveStatus = 'idle';
          this.cdr.markForCheck();
        }, 2000);
      })
    ).subscribe();
  }

  private sortValue(p: Player): number {
    switch (this.sortMode) {
      case 'attackDesc':
        return this.attackScore(p);
      case 'defenseDesc':
        return this.defenseScore(p);
      case 'playmakingDesc':
        return this.playmakingScore(p);
      case 'reboundDesc':
        return this.reboundScore(p);
      case 'stealDesc':
        return this.stealScore(p);
      case 'overallDesc':
      default:
        return this.overall(p);
    }
  }

  private recalculateSummary(): void {
    let total = 0;
    let hasInvalid = false;

    for (const p of this.homePlayers) {
      if (this.getChoice(p.id) !== 'play') continue;
      const minutes = this.getMinutes(p.id);
      if (Number.isFinite(minutes)) {
        total += minutes;
      }
      if (this.isMinutesValueInvalid(minutes)) {
        hasInvalid = true;
      }
    }

    this.totalSelectedMinutes = total;
    this.remainingMinutes = this.totalMinutes - total;
    this.hasInvalidMinutes = hasInvalid;
    this.canSave = this.homePlayers.some(p => this.getChoice(p.id) === 'play') && !hasInvalid && this.remainingMinutes === 0;
  }

  private buildActivePlayers(): InGamePlayer[] {
    const previous = (this.gamePlan.activePlayers ?? []) as InGamePlayer[];
    const prevById = new Map(previous.map(ap => [ap.player.id, ap]));

    const selectedPlayers = this.homePlayers.filter(p => this.getChoice(p.id) === 'play');

    return selectedPlayers.map(p => {
      const existing = prevById.get(p.id) ?? this.defaultInGamePlayer(p);
      const starter = this.getStarterChoice(p.id) === 'starter';
      const minutes = this.getMinutes(p.id);
      return {...existing, starter: starter, minutesPlayed: minutes};
    });
  }

  private syncActivePlayers(): void {
    if (!this.gamePlan) return;
    const next = this.buildActivePlayers();
    this.gamePlan.activePlayers = next;
    this.activePlayersChange.emit(next);
  }
}
