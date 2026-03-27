import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

import { MainpageComponent } from './mainpage/mainpage.component';
import { PlayersList } from './players/players-list/players-list';
import { GameplanPage } from './gameplan/gameplan-page';
import { Calendar } from './calendar/calendar';
import { MatchSummaryPage } from './match-summary/match-summary-page';
import { TrainingCalendarPage } from './training/training-calendar-page';
import { TrainingDetailPage } from './training/training-detail-page';
import { TrainingReportPage } from './training/training-report-page';
import { TeamsPageComponent } from './teams/teams-page';
import { TeamDetailPageComponent } from './teams/team-detail/team-detail-page';

export const routes: Routes = [
  // Page login
  {
    path: 'login',
    loadComponent: () =>
      import('./login/app.login').then(m => m.LoginComponent),
  },

  // Layout principal
  {
    path: '',
    component: MainpageComponent,
    children: [
      // si tu veux forcer une page par défaut
      { path: '', pathMatch: 'full', redirectTo: 'gameplan' },

      { path: 'players', component: PlayersList, canActivate: [AuthGuard] },

      {
        path: 'players/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./players/player-detail/player-detail').then(m => m.PlayerDetail),
      },

      { path: 'teams', component: TeamsPageComponent, canActivate: [AuthGuard] },
      { path: 'teams/:teamId', component: TeamDetailPageComponent, canActivate: [AuthGuard] },

      { path: 'gameplan', component: GameplanPage, canActivate: [AuthGuard] },
      { path: 'calendar', component: Calendar, canActivate: [AuthGuard] },
      { path: 'training', component: TrainingCalendarPage, canActivate: [AuthGuard] },
      { path: 'training/report/:trainingId', component: TrainingReportPage, canActivate: [AuthGuard] },
      { path: 'training/:trainingId', component: TrainingDetailPage, canActivate: [AuthGuard] },
      { path: 'match-summary', component: MatchSummaryPage, canActivate: [AuthGuard] },
    ],
  },

  // fallback
  { path: '**', redirectTo: '' },
];
