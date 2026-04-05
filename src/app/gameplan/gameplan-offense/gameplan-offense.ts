import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatCard, MatCardContent} from '@angular/material/card';
import {GamePlan} from '../../models/gameplan.model';
import {GamePlanApiService} from '../gameplan-service';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {MatButton} from '@angular/material/button';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {RouterLink} from '@angular/router';
import {catchError, finalize, of} from 'rxjs';
import {Player} from '../../models/player.model';
import {
  getDriveDefenseScore,
  getIndicativeDefenseTeamScore,
  getPlaymakingDefenseScore,
  getThreePtDefenseScore,
  getTwoPtDefenseScore,
  TeamScoreSummary,
} from '../../utils/team-score';

type UsageKey = 'usageDrive' | 'usageShoot' | 'usagePost';
type ShotMixKey = 'threePoint' | 'midRange' | 'drive';
type SortMode = 'default' | 'threePtScoreDesc' | 'twoPtScoreDesc' | 'driveScoreDesc';
type DefensiveViewMode = 'all' | 'drive' | 'threePt' | 'playmaking' | 'twoPt';
type OpponentSortMode = 'default' | 'driveDesc' | 'threePtDesc' | 'playmakingDesc' | 'twoPtDesc';
type StatDetail = {
  label: string;
  value: number;
};

const DEFENSIVE_VIEW_ORDER: DefensiveViewMode[] = ['all', 'drive', 'threePt', 'playmaking', 'twoPt'];

@Component({
  selector: 'app-gameplan-offense',
  imports: [
    CommonModule,
    MatSlider,
    MatCardContent,
    MatCard,
    MatProgressSpinner,
    ReactiveFormsModule,
    MatSliderThumb,
    MatButton,
    MatTabGroup,
    MatTab,
    MatExpansionModule,
    RouterLink,
  ],
  templateUrl: './gameplan-offense.html',
  styleUrl: './gameplan-offense.scss',
})
export class GameplanOffense implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;
  @Input('activePlayers') activePlayersInput: InGamePlayer[] | null = null;

  activePlayers: InGamePlayer[] = [];
  opponentPlayers: Player[] = [];
  sortMode: SortMode = 'default';
  opponentSortMode: OpponentSortMode = 'default';
  isOpponentSidebarCollapsed = false;
  defensiveViewByPlayerId = new Map<string, DefensiveViewMode>();

  maxGeneralUsage = 100;
  maxPerPlayerUsage = 30;

  isSavingUsage = false;
  saveStatusUsage: 'idle' | 'success' | 'error' = 'idle';
  isSavingShotMix = false;
  saveStatusShotMix: 'idle' | 'success' | 'error' = 'idle';

  shotMixForm = new FormGroup(
    {
      threePoint: new FormControl(10, {nonNullable: true, validators: [Validators.min(10), Validators.max(100)]}),
      midRange: new FormControl(10, {nonNullable: true, validators: [Validators.min(10), Validators.max(100)]}),
      drive: new FormControl(10, {nonNullable: true, validators: [Validators.min(10), Validators.max(100)]}),
    },
    {validators: [this.totalShareValidator()]},
  );

  constructor(
    private api: GamePlanApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.hydrateShotMix();
    }

    if ((changes['gamePlan'] || changes['activePlayersInput']) && this.gamePlan) {
      const source = this.activePlayersInput ?? this.gamePlan.activePlayers ?? [];
      this.activePlayers = source.map((p) => ({...p}));
      this.opponentPlayers = this.gamePlan.opponentTeam?.players ?? [];
    }
  }

  get displayPlayers(): InGamePlayer[] {
    return this.getSortedPlayers();
  }

  get displayOpponentPlayers(): Player[] {
    if (this.opponentSortMode === 'default') {
      return [...this.opponentPlayers];
    }

    const sorted = [...this.opponentPlayers];
    sorted.sort((a, b) => this.getOpponentSortValue(b) - this.getOpponentSortValue(a));
    return sorted;
  }

  get opponentDefenseTeamScore(): TeamScoreSummary {
    return getIndicativeDefenseTeamScore(this.opponentPlayers);
  }

  setSortMode(mode: SortMode): void {
    this.sortMode = mode;
  }

  setOpponentSortMode(mode: OpponentSortMode): void {
    this.opponentSortMode = mode;
  }

  toggleOpponentSidebar(): void {
    this.isOpponentSidebarCollapsed = !this.isOpponentSidebarCollapsed;
  }

  getDefensiveView(playerId: string): DefensiveViewMode {
    return this.defensiveViewByPlayerId.get(playerId) ?? 'all';
  }

  cycleDefensiveView(playerId: string, direction: -1 | 1): void {
    this.defensiveViewByPlayerId.set(
      playerId,
      this.getNextView(DEFENSIVE_VIEW_ORDER, this.getDefensiveView(playerId), direction),
    );
  }

  defensiveViewLabel(mode: DefensiveViewMode): string {
    switch (mode) {
      case 'all':
        return 'Tous';
      case 'drive':
        return 'Def Drive';
      case 'threePt':
        return 'Def 3PT';
      case 'playmaking':
        return 'Def Playmaking';
      case 'twoPt':
        return 'Def 2PT';
    }
  }

  defensiveDetails(player: Player, mode: DefensiveViewMode): StatDetail[] {
    switch (mode) {
      case 'all':
        return [
          {label: 'DR DEF', value: getDriveDefenseScore(player)},
          {label: 'PLAY DEF', value: getPlaymakingDefenseScore(player)},
          {label: '2PT DEF', value: getTwoPtDefenseScore(player)},
          {label: '3PT DEF', value: getThreePtDefenseScore(player)},
        ];
      case 'drive':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'DEF EXT', value: player.defExterieur},
          {label: 'END', value: player.endurance},
          {label: 'IQ', value: player.iq},
          {label: 'STL', value: player.steal},
          {label: 'DEF POST', value: player.defPoste},
        ];
      case 'threePt':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'DEF EXT', value: player.defExterieur},
          {label: 'END', value: player.endurance},
          {label: 'IQ', value: player.iq},
        ];
      case 'playmaking':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'DEF EXT', value: player.defExterieur},
          {label: 'END', value: player.endurance},
          {label: 'IQ DEF', value: player.basketballIqDef},
          {label: 'STL', value: player.steal},
        ];
      case 'twoPt':
        return [
          {label: 'DEF POST', value: player.defPoste},
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'END', value: player.endurance},
          {label: 'IQ', value: player.iq},
          {label: 'STL', value: player.steal},
        ];
    }
  }

  currentDefensiveScore(player: Player, mode: DefensiveViewMode): number {
    switch (mode) {
      case 'all':
        return getPlaymakingDefenseScore(player);
      case 'drive':
        return getDriveDefenseScore(player);
      case 'threePt':
        return getThreePtDefenseScore(player);
      case 'playmaking':
        return getPlaymakingDefenseScore(player);
      case 'twoPt':
        return getTwoPtDefenseScore(player);
    }
  }

  private getTotalExcluding(key: UsageKey, exclude: InGamePlayer): number {
    let total = 0;
    for (const p of this.activePlayers) {
      if (p === exclude) continue;
      total += p[key] ?? 0;
    }
    return total;
  }

  setUsage(player: InGamePlayer, key: UsageKey, value: number) {
    let next = value;

    if (value > this.maxPerPlayerUsage) next = this.maxPerPlayerUsage;

    const totalWithoutPlayer = this.getTotalExcluding(key, player);
    const remaining = this.maxGeneralUsage - totalWithoutPlayer;

    if (remaining <= 0) {
      player[key] = 0;
      return;
    }

    if (next > remaining) {
      next = remaining;
    }

    player[key] = next;
  }

  saveActivePlayers(): void {
    if (!this.gamePlan) return;
    this.gamePlan.activePlayers = this.activePlayers;

    this.isSavingUsage = true;
    this.saveStatusUsage = 'idle';

    this.api
      .saveGamePlan(this.gamePlan)
      .pipe(
        catchError(() => {
          this.saveStatusUsage = 'error';
          this.cdr.markForCheck();
          return of(null);
        }),
        finalize(() => {
          this.isSavingUsage = false;
          if (this.saveStatusUsage !== 'error') {
            this.saveStatusUsage = 'success';
          }
          this.cdr.markForCheck();
          setTimeout(() => {
            this.saveStatusUsage = 'idle';
            this.cdr.markForCheck();
          }, 2000);
        }),
      )
      .subscribe();
  }

  get totalPercent(): number {
    const values = this.shotMixForm.getRawValue();
    return this.roundToInt(values.threePoint + values.midRange + values.drive);
  }

  get isShotMixInvalid(): boolean {
    return this.shotMixForm.invalid;
  }

  get totalUsageDrive(): number {
    return this.sumUsage('usageDrive');
  }

  get totalUsageShoot(): number {
    return this.sumUsage('usageShoot');
  }

  get totalUsagePost(): number {
    return this.sumUsage('usagePost');
  }

  get remainingUsageDrive(): number {
    return this.maxGeneralUsage - this.totalUsageDrive;
  }

  get remainingUsageShoot(): number {
    return this.maxGeneralUsage - this.totalUsageShoot;
  }

  get remainingUsagePost(): number {
    return this.maxGeneralUsage - this.totalUsagePost;
  }

  saveShotMix(): void {
    if (!this.gamePlan) return;

    if (this.shotMixForm.invalid) {
      this.shotMixForm.markAllAsTouched();
      return;
    }

    const values = this.shotMixForm.getRawValue();
    this.gamePlan.threePointAttemptShare = this.percentToDecimal(values.threePoint);
    this.gamePlan.midRangeAttemptShare = this.percentToDecimal(values.midRange);
    this.gamePlan.driveAttemptShare = this.percentToDecimal(values.drive);

    this.isSavingShotMix = true;
    this.saveStatusShotMix = 'idle';

    this.api
      .saveGamePlan(this.gamePlan)
      .pipe(
        catchError(() => {
          this.saveStatusShotMix = 'error';
          this.cdr.markForCheck();
          return of(null);
        }),
        finalize(() => {
          this.isSavingShotMix = false;
          if (this.saveStatusShotMix !== 'error') {
            this.saveStatusShotMix = 'success';
          }
          this.cdr.markForCheck();
          setTimeout(() => {
            this.saveStatusShotMix = 'idle';
            this.cdr.markForCheck();
          }, 2000);
        }),
      )
      .subscribe();
  }

  setShotMixValue(key: ShotMixKey, value: number): void {
    const control = this.shotMixForm.get(key);
    if (!control) return;
    control.setValue(this.roundToInt(value));
    control.markAsDirty();
  }

  private hydrateShotMix(): void {
    this.shotMixForm.setValue(
      {
        threePoint: this.decimalToPercent(this.gamePlan.threePointAttemptShare),
        midRange: this.decimalToPercent(this.gamePlan.midRangeAttemptShare),
        drive: this.decimalToPercent(this.gamePlan.driveAttemptShare),
      },
      {emitEvent: false},
    );
    this.shotMixForm.markAsPristine();
  }

  private totalShareValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const group = control as FormGroup;
      const values = group.getRawValue() as {threePoint: number; midRange: number; drive: number};
      const total = values.threePoint + values.midRange + values.drive;
      return total > 100 ? {sumExceeded: true} : null;
    };
  }

  private decimalToPercent(value: number | null | undefined): number {
    if (!value) return 0;
    return this.roundToInt(value * 100);
  }

  private percentToDecimal(value: number): number {
    return this.roundToInt(value) / 100;
  }

  private roundToInt(value: number): number {
    return Math.round(value);
  }

  private sumUsage(key: UsageKey): number {
    return this.activePlayers.reduce((total, player) => total + (player[key] ?? 0), 0);
  }

  private getSortedPlayers(): InGamePlayer[] {
    if (this.sortMode === 'default') {
      return [...this.activePlayers];
    }

    const sorted = [...this.activePlayers];
    sorted.sort((a, b) => this.getSortValue(b) - this.getSortValue(a));
    return sorted;
  }

  private getSortValue(player: InGamePlayer): number {
    switch (this.sortMode) {
      case 'threePtScoreDesc':
        return player.threePtScore ?? 0;
      case 'twoPtScoreDesc':
        return player.twoPtScore ?? 0;
      case 'driveScoreDesc':
        return player.driveScore ?? 0;
      default:
        return 0;
    }
  }

  private getOpponentSortValue(player: Player): number {
    switch (this.opponentSortMode) {
      case 'driveDesc':
        return getDriveDefenseScore(player);
      case 'threePtDesc':
        return getThreePtDefenseScore(player);
      case 'playmakingDesc':
        return getPlaymakingDefenseScore(player);
      case 'twoPtDesc':
        return getTwoPtDefenseScore(player);
      default:
        return 0;
    }
  }

  private getNextView<T extends string>(order: readonly T[], current: T, direction: -1 | 1): T {
    const currentIndex = order.indexOf(current);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + order.length) % order.length;
    return order[nextIndex];
  }
}
