import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {catchError, distinctUntilChanged, filter, map, of, startWith, switchMap} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs/operators';

import {TrainingApiService} from './training.api';
import {TrainingDTO, TrainingType} from './training.models';
import {getTrainingTypeUi, TRAINING_TYPE_OPTIONS, TrainingTypeUi} from './training-type.ui';
import {getMockTrainingById} from './training.mock';

interface TrainingLoadState {
  status: 'loading' | 'loaded' | 'error';
  training: TrainingDTO | null;
  errorMsg: string | null;
}

@Component({
  selector: 'app-training-detail-page',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, MatButtonModule],
  templateUrl: './training-detail-page.html',
  styleUrl: './training-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingDetailPage {
  readonly trainingTypeOptions = TRAINING_TYPE_OPTIONS;
  readonly selectedType = signal<TrainingType | null>(null);
  readonly isUpdating = signal(false);
  readonly updateErrorMsg = signal<string | null>(null);

  private readonly api = inject(TrainingApiService);
  private readonly route = inject(ActivatedRoute);

  private readonly trainingState = toSignal<TrainingLoadState>(
    this.route.paramMap.pipe(
      map((params) => params.get('trainingId')),
      filter(filterTrainingId),
      distinctUntilChanged(),
      switchMap((trainingId) =>
        this.api.getTrainingById(trainingId).pipe(
          map((training) => buildTrainingState('loaded', training, null)),
          startWith(buildTrainingState('loading', null, null)),
          catchError((error) => {
            console.error(error);
            const mock = getMockTrainingById(trainingId);
            if (mock) {
              return of(buildTrainingState('loaded', mock, 'Mode mock actif.'));
            }
            return of(buildTrainingState('error', null, 'Impossible de charger cet entrainement.'));
          })
        )
      )
    ),
    {requireSync: true}
  );

  readonly trainingOverride = signal<TrainingDTO | null>(null);
  readonly training = computed(() => this.trainingOverride() ?? this.trainingState().training);
  readonly isLoading = computed(
    () => this.trainingState().status === 'loading' && !this.trainingOverride()
  );
  readonly errorMsg = computed(() => this.trainingState().errorMsg);

  constructor() {
    effect(() => {
      const training = this.trainingState().training;
      if (training) {
        this.trainingOverride.set(null);
        this.selectedType.set(training.trainingType);
        this.updateErrorMsg.set(null);
      }
    });
  }

  onTypeChange(type: TrainingType): void {
    if (this.isUpdating()) return;
    this.selectedType.set(type);
  }

  saveType(): void {
    const training = this.training();
    const selected = this.selectedType();

    if (!training || !selected || selected === training.trainingType || this.isUpdating()) {
      return;
    }

    this.isUpdating.set(true);
    this.updateErrorMsg.set(null);

    this.api
      .updateTrainingType(training.id, selected)
      .pipe(
        finalize(() => {
          this.isUpdating.set(false);
        })
      )
      .subscribe({
        next: (updated) => {
          this.trainingOverride.set(updated);
          this.selectedType.set(updated.trainingType);
        },
        error: (err) => {
          console.error(err);
          this.updateErrorMsg.set('Impossible de mettre a jour le type.');
        },
      });
  }

  getTypeUi(type: TrainingType | null | undefined): TrainingTypeUi {
    return getTrainingTypeUi(type);
  }
}

function filterTrainingId(value: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildTrainingState(
  status: TrainingLoadState['status'],
  training: TrainingDTO | null,
  errorMsg: string | null
): TrainingLoadState {
  return {status, training, errorMsg};
}
