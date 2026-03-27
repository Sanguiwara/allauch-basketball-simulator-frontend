import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {catchError, of} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

import {TrainingApiService} from './training.api';
import {TrainingDTO} from './training.models';
import {getTrainingTypeUi, TrainingTypeUi} from './training-type.ui';
import {getMockTrainings} from './training.mock';

interface TrainingCalendarDay {
  key: string;
  date: Date;
  inMonth: boolean;
  trainings: TrainingDTO[];
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

@Component({
  selector: 'app-training-calendar-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './training-calendar-page.html',
  styleUrl: './training-calendar-page.scss',
})
export class TrainingCalendarPage {
  readonly weekDays = WEEK_DAYS;
  readonly month = signal(startOfMonth(new Date()));
  readonly errorMsg = signal<string | null>(null);

  private readonly api = inject(TrainingApiService);
  private readonly router = inject(Router);

  private readonly trainings = toSignal(
    this.api.getTrainingsForUser().pipe(
      catchError((error) => {
        console.error(error);
        this.errorMsg.set('Impossible de charger les entrainements. Donnees mock affichees.');
        return of(getMockTrainings());
      })
    ),
    {initialValue: []}
  );

  readonly days = computed(() => buildCalendarDays(this.month(), this.trainings()));
  readonly todayKey = toDateKey(new Date());

  goToPreviousMonth(): void {
    const value = this.month();
    this.month.set(new Date(value.getFullYear(), value.getMonth() - 1, 1));
  }

  goToNextMonth(): void {
    const value = this.month();
    this.month.set(new Date(value.getFullYear(), value.getMonth() + 1, 1));
  }

  openTraining(training: TrainingDTO): void {
    if (this.isPastTraining(training)) {
      void this.router.navigate(['/training', 'report', training.id]);
      return;
    }

    void this.router.navigate(['/training', training.id]);
  }

  getTypeUi(type: TrainingDTO['trainingType'] | null | undefined): TrainingTypeUi {
    return getTrainingTypeUi(type);
  }

  isPastTraining(training: TrainingDTO): boolean {
    const trainingDate = new Date(training.executeAt);
    return trainingDate.getTime() < Date.now();
  }
}

function buildCalendarDays(month: Date, trainings: TrainingDTO[]): TrainingCalendarDay[] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const start = startOfWeek(first);
  const end = endOfWeek(last);

  const trainingsByDay = new Map<string, TrainingDTO[]>();
  for (const training of trainings) {
    const key = toDateKey(new Date(training.executeAt));
    const list = trainingsByDay.get(key) ?? [];
    list.push(training);
    trainingsByDay.set(key, list);
  }
  for (const list of trainingsByDay.values()) {
    list.sort(
      (a, b) => new Date(a.executeAt).getTime() - new Date(b.executeAt).getTime()
    );
  }

  const days: TrainingCalendarDay[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const key = toDateKey(cursor);
    days.push({
      key,
      date: new Date(cursor),
      inMonth: cursor.getMonth() === month.getMonth(),
      trainings: trainingsByDay.get(key) ?? [],
    });
  }

  return days;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date): Date {
  const dayIndex = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayIndex);
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  return addDays(start, 6);
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
