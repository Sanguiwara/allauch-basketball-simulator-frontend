import {CommonModule} from '@angular/common';
import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatCard, MatCardContent} from '@angular/material/card';
import {GamePlan} from '../../models/gameplan.model';
import {GamePlanApiService} from '../gameplan-service';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {MatButton} from '@angular/material/button';
import {MatTab, MatTabGroup} from '@angular/material/tabs';

type UsageKey = 'usageDrive' | 'usageShoot' | 'usagePost';
type ShotMixKey = 'threePoint' | 'midRange' | 'drive';

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
  ],
  templateUrl: './gameplan-offense.html',
  styleUrl: './gameplan-offense.scss',
})
export class GameplanOffense implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;

  activePlayers: InGamePlayer[] = [];

  maxGeneralUsage = 100;
  maxPerPlayerUsage = 30;

  shotMixForm = new FormGroup(
    {
      threePoint: new FormControl(10, {nonNullable: true, validators: [Validators.min(10), Validators.max(100)]}),
      midRange: new FormControl(10, {nonNullable: true, validators: [Validators.min(10), Validators.max(100)]}),
      drive: new FormControl(10, {nonNullable: true, validators: [Validators.min(10), Validators.max(100)]}),
    },
    {validators: [this.totalShareValidator()]},
  );

  constructor(private api: GamePlanApiService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.activePlayers = (this.gamePlan.activePlayers ?? []).map((p) => ({...p}));
      this.hydrateShotMix();
    }


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

    this.api.saveGamePlan(this.gamePlan).subscribe();
  }

  get totalPercent(): number {
    const values = this.shotMixForm.getRawValue();
    return this.roundToInt(values.threePoint + values.midRange + values.drive);
  }

  get isShotMixInvalid(): boolean {
    return this.shotMixForm.invalid;
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

    this.api.saveGamePlan(this.gamePlan).subscribe();
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
}
