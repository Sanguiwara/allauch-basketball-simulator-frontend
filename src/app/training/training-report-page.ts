import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {catchError, distinctUntilChanged, filter, map, of, startWith, switchMap} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

import {TrainingApiService} from './training.api';
import {TrainingDTO} from './training.models';
import {getTrainingTypeUi, TrainingTypeUi} from './training-type.ui';
import {getMockTrainingById} from './training.mock';
import {PlayerProgressionTableComponent} from './player-progression-table/player-progression-table.component';

interface TrainingLoadState {
  status: 'loading' | 'loaded' | 'error';
  training: TrainingDTO | null;
  errorMsg: string | null;
}

@Component({
  selector: 'app-training-report-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, PlayerProgressionTableComponent],
  templateUrl: './training-report-page.html',
  styleUrl: './training-report-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingReportPage {
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
            return of(buildTrainingState('error', null, 'Impossible de charger le rapport.'));
          })
        )
      )
    ),
    {requireSync: true}
  );

  readonly training = computed(() => this.trainingState().training);
  readonly isLoading = computed(() => this.trainingState().status === 'loading');
  readonly errorMsg = computed(() => this.trainingState().errorMsg);

  constructor() {}

  getTypeUi(type: TrainingDTO['trainingType'] | null | undefined): TrainingTypeUi {
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
