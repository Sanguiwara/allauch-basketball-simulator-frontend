import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {RouterLink} from '@angular/router';
import {catchError, finalize, of} from 'rxjs';

import {GamePlan} from '../../models/gameplan.model';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {Player} from '../../models/player.model';
import {GamePlanApiService} from '../gameplan-service';
type PlayerMinutesVM = {
  id: string;
  player: Player;
  minutes: number;
  invalid: boolean;
};

@Component({
  selector: 'app-gameplan-minutes-played',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardContent, MatButton, MatSlider, MatSliderThumb, RouterLink],
  templateUrl: './gameplan-minutes-played.html',
  styleUrl: './gameplan-minutes-played.scss',
})
export class GameplanMinutesPlayedComponent implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;
  @Input('activePlayers') activePlayersInput: InGamePlayer[] | null = null;

  readonly minMinutes = 0;
  readonly maxMinutes = 40;
  readonly totalMinutes = 200;

  activePlayers: InGamePlayer[] = [];
  viewPlayers: PlayerMinutesVM[] = [];
  private viewById = new Map<string, PlayerMinutesVM>();

  totalSelectedMinutes = 0;
  remainingMinutes = this.totalMinutes;
  hasInvalidMinutes = false;
  canSave = false;
  isSaving = false;
  saveStatus: 'idle' | 'success' | 'error' = 'idle';

  constructor(private api: GamePlanApiService, private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['gamePlan'] || changes['activePlayersInput']) && this.gamePlan) {
      this.hydrateFromPlan();
    }
  }

  private hydrateFromPlan(): void {
    const source = this.activePlayersInput ?? this.gamePlan.activePlayers ?? [];
    this.activePlayers = source.map((p) => ({...p}));

    this.viewPlayers = this.activePlayers.map((p) => {
      const minutes = Number.isFinite(p.minutesPlayed) ? p.minutesPlayed : 0;
      const invalid = this.isMinutesValueInvalid(minutes);
      return {
        id: p.player.id,
        player: p.player,
        minutes,
        invalid,
      };
    });

    this.viewById = new Map(this.viewPlayers.map((p) => [p.id, p]));
    this.recalculateSummary();
  }

  setMinutes(playerId: string, value: number): void {
    const player = this.viewById.get(playerId);
    if (!player) return;
    player.minutes = value;
    player.invalid = this.isMinutesValueInvalid(value);
    this.recalculateSummary();
  }

  private isMinutesValueInvalid(value: number): boolean {
    if (!Number.isInteger(value)) return true;
    return value < this.minMinutes || value > this.maxMinutes;
  }

  saveMinutes(): void {
    if (!this.gamePlan || !this.canSave) return;

    this.activePlayers = this.activePlayers.map((p) => {
      const minutes = this.viewById.get(p.player.id)?.minutes ?? 0;
      return {...p, minutesPlayed: minutes};
    });

    this.gamePlan.activePlayers = this.activePlayers;
    this.isSaving = true;
    this.saveStatus = 'idle';

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
      p.timingRebond,
      p.agressiviteRebond,
      p.steal,
    ]);
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

  overviewStats(player: Player): {label: string; value: number}[] {
    return [
      {label: 'OVR', value: this.overall(player)},
      {label: 'ATT', value: this.attackScore(player)},
      {label: 'DEF', value: this.defenseScore(player)},
      {label: 'PM', value: this.playmakingScore(player)},
    ];
  }

  private recalculateSummary(): void {
    let total = 0;
    let hasInvalid = false;

    for (const p of this.viewPlayers) {
      if (typeof p.minutes === 'number' && Number.isFinite(p.minutes)) {
        total += p.minutes;
      }
      if (p.invalid) {
        hasInvalid = true;
      }
    }

    this.totalSelectedMinutes = total;
    this.remainingMinutes = this.totalMinutes - total;
    this.hasInvalidMinutes = hasInvalid;
    this.canSave = this.viewPlayers.length > 0 && !hasInvalid && this.remainingMinutes === 0;
  }
}
