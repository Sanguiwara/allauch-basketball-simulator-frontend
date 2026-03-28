import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {catchError, distinctUntilChanged, map, of, startWith, Subject, switchMap, tap} from 'rxjs';
import {TeamsApiService} from '../teams-api.service';
import {TeamDTO} from '../teams.api';
import {PlayerSummaryMapper} from '../player-summary.mapper';
import {PlayerSummaryVM, TeamDetailVM, TeamStatsVM} from '../teams.view-models';
import {filterBadgeNamesWithoutParentheses} from '../../utils/badge-name';
import {SessionStore} from '../../session.store';

@Component({
  selector: 'app-team-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './team-detail-page.html',
  styleUrl: './team-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDetailPageComponent {
  private route = inject(ActivatedRoute);
  private api = inject(TeamsApiService);
  private summaryMapper = inject(PlayerSummaryMapper);
  private sessionStore = inject(SessionStore);

  private readonly refresh$ = new Subject<void>();

  readonly editableName = signal('');
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly state$ = this.route.paramMap.pipe(
    map(params => params.get('teamId')),
    distinctUntilChanged(),
    switchMap(teamId =>
      teamId
        ? this.refresh$.pipe(
          startWith(null),
          switchMap(() => this.loadTeam(teamId)),
        )
        : of({ status: 'notfound' } as const),
    ),
  );

  private loadTeam(teamId: string) {
    return this.api.getTeamById(teamId).pipe(
      map(team => this.toTeamDetailVm(team)),
      tap(team => this.editableName.set(team.name)),
      map(team => ({ status: 'loaded', team } as const)),
      catchError(() => this.api.getTeams().pipe(
        map(teams => teams.find(team => team.id === teamId) ?? null),
        map(team => (team ? this.toTeamDetailVm(team) : null)),
        tap(team => {
          if (team) this.editableName.set(team.name);
        }),
        map(team => (team ? ({ status: 'loaded', team } as const) : ({ status: 'notfound' } as const))),
        catchError(() => of({ status: 'error', message: 'Impossible de charger l equipe.' } as const)),
      )),
      startWith({ status: 'loading' } as const),
    );
  }

  private toTeamDetailVm(team: TeamDTO): TeamDetailVM {
    const category = (team.category ?? team.ageCategory ?? '').trim() || 'N/A';
    const players = (team.players ?? []).map(player => this.summaryMapper.toSummary(player));
    return {
      id: team.id,
      clubId: team.clubId,
      name: (team.name ?? '').trim() || 'Equipe sans nom',
      category,
      gender: team.gender,
      players,
      stats: this.toTeamStats(team, players),
    };
  }

  private toTeamStats(team: TeamDTO, players: PlayerSummaryVM[]): TeamStatsVM {
    const roster = team.players ?? [];

    return {
      threePts: this.avg(roster.map(player => player.tir3Pts)),
      twoPts: this.avg(roster.map(player => player.tir2Pts)),
      drive: this.avg(roster.flatMap(player => [player.finitionAuCercle, player.floater, player.ballhandling, player.speed])),
      defense: this.avg(roster.flatMap(player => [player.defExterieur, player.defPoste, player.protectionCercle])),
      rebound: this.avg(roster.flatMap(player => [player.timingRebond, player.agressiviteRebond])),
      steal: this.avg(roster.map(player => player.steal)),
      morale: this.avg(players.map(player => player.morale)),
    };
  }

  private avg(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((total, value) => total + value, 0);
    return Math.round(sum / values.length);
  }

  visibleBadges(badges: string[]): string[] {
    return filterBadgeNamesWithoutParentheses(badges ?? []);
  }

  canEditTeam(team: TeamDetailVM): boolean {
    const clubId = this.sessionStore.clubId();
    return !!clubId && team.clubId === clubId;
  }

  onNameInput(value: string): void {
    this.editableName.set(value);
    this.saveError.set(null);
  }

  canSaveName(team: TeamDetailVM): boolean {
    const nextName = this.editableName().trim();
    return nextName.length > 0 && nextName !== team.name;
  }

  saveTeamName(team: TeamDetailVM): void {
    if (!this.canEditTeam(team)) return;

    const nextName = this.editableName().trim();
    if (!nextName) {
      this.saveError.set('Le nom est requis.');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    this.api.updateTeamName(team.id, nextName).subscribe({
      next: (updated) => {
        this.editableName.set((updated.name ?? nextName).trim());
        this.refresh$.next();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error(err);
        const message = err?.error?.message ?? 'Impossible de sauvegarder le nom.';
        this.saveError.set(message);
        this.isSaving.set(false);
      },
    });
  }
}
