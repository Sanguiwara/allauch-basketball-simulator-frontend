import { Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { PlayersList } from './players/players-list/players-list';

export const routes: Routes = [
  {
    path: '',
    component: MainpageComponent,
    children: [
      { path: 'players', component: PlayersList },
      {
        path: 'players/:id',
        loadComponent: () =>
          import('./players/player-detail/player-detail').then(m => m.PlayerDetail),
      },
    ],
  },
];
