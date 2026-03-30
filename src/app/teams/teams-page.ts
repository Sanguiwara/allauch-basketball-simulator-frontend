import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {catchError, map, of, startWith} from 'rxjs';
import {TeamsApiService} from './teams-api.service';
import {TeamDTO} from './teams.api';
import {TeamListItemVM} from './teams.view-models';
import {SessionStore} from '../session.store';

export function toTeamListItem(team: TeamDTO): TeamListItemVM {
  const name = (team.name ?? '').trim() || 'Equipe sans nom';
  const category = (team.category ?? team.ageCategory ?? '').trim() || 'N/A';
  const playerCount = Array.isArray(team.players) ? team.players.length : 0;

  return {
    id: team.id,
    clubId: team.clubId,
    name,
    category,
    gender: team.gender,
    playerCount,
  };
}

export function isUserTeam(teamClubId: string, userClubId: string | null): boolean {
  return !!userClubId && teamClubId === userClubId;
}

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './teams-page.html',
  styleUrl: './teams-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsPageComponent {
  private api = inject(TeamsApiService);
  readonly userClubId = inject(SessionStore).clubId;
  readonly isUserTeam = isUserTeam;

  readonly state$ = this.api.getTeams().pipe(
    map(teams => teams.map(toTeamListItem)),
    map(teams => (teams.length ? ({ status: 'loaded', teams } as const) : ({ status: 'empty' } as const))),
    startWith({ status: 'loading' } as const),
    catchError(() => of({ status: 'error', message: 'Impossible de charger les equipes.' } as const)),
  );
}
