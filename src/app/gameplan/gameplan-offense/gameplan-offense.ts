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

type UsageKey = 'usageDrive' | 'usageShoot' | 'usagePost';
type ShotMixKey = 'threePoint' | 'midRange' | 'drive';
type SortMode = 'default' | 'threePtScoreDesc' | 'twoPtScoreDesc' | 'driveScoreDesc';

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
  sortMode: SortMode = 'default';

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

  constructor(private api: GamePlanApiService, private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.hydrateShotMix();
    }

    if ((changes['gamePlan'] || changes['activePlayersInput']) && this.gamePlan) {
      const source = this.activePlayersInput ?? this.gamePlan.activePlayers ?? [];
      this.activePlayers = source.map((p) => ({...p}));
    }
  }

  get displayPlayers(): InGamePlayer[] {
    return this.getSortedPlayers();
  }

  setSortMode(mode: SortMode): void {
    this.sortMode = mode;
  }

  /** Somme en excluant un joueur (utile pour calculer ce qu'il reste) */
  private getTotalExcluding(key: UsageKey, exclude: InGamePlayer): number {
    let total = 0;
    for (const p of this.activePlayers) {
      if (p === exclude) continue;
      total += (p[key] ?? 0);
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

    this.api.saveGamePlan(this.gamePlan).pipe(
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
      })
    ).subscribe();
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

    this.api.saveGamePlan(this.gamePlan).pipe(
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
      })
    ).subscribe();
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
    sorted.sort((a, b) => {
      const valueA = this.getSortValue(a);
      const valueB = this.getSortValue(b);
      return valueB - valueA;
    });
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
}
