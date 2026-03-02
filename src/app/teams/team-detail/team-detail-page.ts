import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {catchError, distinctUntilChanged, map, of, startWith, switchMap} from 'rxjs';
import {TeamsApiService} from '../teams-api.service';
import {TeamDTO} from '../teams.api';
import {PlayerSummaryMapper} from '../player-summary.mapper';
import {PlayerSummaryVM, TeamDetailVM} from '../teams.view-models';

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './team-detail-page.html',
  styleUrl: './team-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDetailPageComponent {
  private route = inject(ActivatedRoute);
  private api = inject(TeamsApiService);
  private summaryMapper = inject(PlayerSummaryMapper);

  readonly state$ = this.route.paramMap.pipe(
    map(params => params.get('teamId')),
    distinctUntilChanged(),
    switchMap(teamId => (teamId ? this.loadTeam(teamId) : of({ status: 'notfound' } as const))),
  );

  trackByPlayerId = (_: number, player: PlayerSummaryVM) => player.id;
  trackByBadge = (_: number, badge: string) => badge;

  private loadTeam(teamId: string) {
    return this.api.getTeamById(teamId).pipe(
      map(team => ({ status: 'loaded', team: this.toTeamDetailVm(team) } as const)),
      catchError(() => this.api.getTeams().pipe(
        map(teams => teams.find(team => team.id === teamId) ?? null),
        map(team => (team ? ({ status: 'loaded', team: this.toTeamDetailVm(team) } as const) : ({ status: 'notfound' } as const))),
        catchError(() => of({ status: 'error', message: 'Impossible de charger l equipe.' } as const)),
      )),
      startWith({ status: 'loading' } as const),
    );
  }

  private toTeamDetailVm(team: TeamDTO): TeamDetailVM {
    const category = (team.category ?? team.ageCategory ?? '').trim() || 'N/A';

    return {
      id: team.id,
      name: (team.name ?? '').trim() || 'Equipe sans nom',
      category,
      gender: team.gender,
      players: (team.players ?? []).map(player => this.summaryMapper.toSummary(player)),
    };
  }
}
