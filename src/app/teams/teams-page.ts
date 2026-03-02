import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {catchError, map, of, startWith} from 'rxjs';
import {TeamsApiService} from './teams-api.service';
import {TeamDTO} from './teams.api';
import {TeamListItemVM} from './teams.view-models';

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

  readonly state$ = this.api.getTeams().pipe(
    map(teams => teams.map(team => this.toListItem(team))),
    map(teams => (teams.length ? ({ status: 'loaded', teams } as const) : ({ status: 'empty' } as const))),
    startWith({ status: 'loading' } as const),
    catchError(() => of({ status: 'error', message: 'Impossible de charger les equipes.' } as const)),
  );

  trackByTeamId = (_: number, team: TeamListItemVM) => team.id;

  private toListItem(team: TeamDTO): TeamListItemVM {
    const name = (team.name ?? '').trim() || 'Equipe sans nom';
    const category = (team.category ?? team.ageCategory ?? '').trim() || 'N/A';
    const playerCount = Array.isArray(team.players) ? team.players.length : 0;

    return {
      id: team.id,
      name,
      category,
      gender: team.gender,
      playerCount,
    };
  }
}
