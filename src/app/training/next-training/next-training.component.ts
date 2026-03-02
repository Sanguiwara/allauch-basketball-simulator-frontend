import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute} from '@angular/router';
import {finalize} from 'rxjs/operators';

import {TrainingApiService} from '../training.api';
import {TrainingDTO, TrainingType} from '../training.models';
import {getTrainingTypeUi, TRAINING_TYPE_OPTIONS, TrainingTypeUi,} from '../training-type.ui';

@Component({
  selector: 'app-next-training',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, MatButtonModule],
  templateUrl: './next-training.component.html',
  styleUrl: './next-training.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextTrainingComponent implements OnInit, OnChanges {
  @Input() teamId?: string | null;

  training: TrainingDTO | null = null;
  selectedType: TrainingType | null = null;
  isLoading = false;
  isUpdating = false;
  errorMsg: string | null = null;

  readonly trainingTypeOptions = TRAINING_TYPE_OPTIONS;

  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(TrainingApiService);

  ngOnInit(): void {
    this.loadTraining();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamId'] && !changes['teamId'].firstChange) {
      this.loadTraining();
    }
  }

  loadTraining(): void {
    const teamId = this.resolveTeamId();

    if (!teamId) {
      this.errorMsg = 'TeamId manquant.';
      this.training = null;
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMsg = null;
    this.cdr.markForCheck();

    this.api
      .getNextTrainingForTeam(teamId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (training) => {
          this.training = training;
          this.selectedType = training?.trainingType ?? null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error(err);
          this.training = null;
          this.errorMsg = 'Impossible de charger le prochain entraînement.';
          this.cdr.markForCheck();
        },
      });
  }

  onTypeChange(type: TrainingType): void {
    if (!this.training || this.isUpdating) return;
    this.selectedType = type;
    this.cdr.markForCheck();
  }

  saveType(): void {
    if (!this.training || this.isUpdating) return;
    if (!this.selectedType || this.selectedType === this.training.trainingType) return;

    const nextType = this.selectedType;

    this.isUpdating = true;
    this.errorMsg = null;
    this.cdr.markForCheck();

    this.api
      .updateTrainingType(this.training.id, nextType)
      .pipe(
        finalize(() => {
          this.isUpdating = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (updated) => {
          this.training = updated;
          this.selectedType = updated.trainingType;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Impossible de mettre à jour le type.';
          this.cdr.markForCheck();
        },
      });
  }

  getTypeUi(type: TrainingType | null | undefined): TrainingTypeUi {
    return getTrainingTypeUi(type);
  }

  private resolveTeamId(): string | null {
    // Priority: @Input > route param > query param
    // return (
    //   this.teamId ??
    //   this.route.snapshot.paramMap.get('teamId') ??
    //   this.route.snapshot.queryParamMap.get('teamId')
    // );
    return "6ad98586-bbef-434f-8235-bb48e89aac73";
  }
}
