import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationExtras, Router} from '@angular/router';
import {CalendarApiService} from './calendar-api.service';
import {SimplifiedGame} from '../models/simplified-game.model';

import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SessionStore} from '../session.store';
import {BoxScore} from '../models/game-result.model';
import {calculateScore} from '../utils/game-result.utils';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {

  games: SimplifiedGame[] = [];

  // Id de l’équipe sélectionnée
  selectedTeamId: string | null = null;

  // Liste des équipes (dérivée des games)
  teams: { id: string; name: string }[] = [];

  constructor(
    private api: CalendarApiService,
    private sessionStore: SessionStore,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.api.getGames().subscribe({
      next: (games) => {
        // tri par date (croissant)
        this.games = [...games].sort(
          (a, b) => new Date(a.executeAt).getTime() - new Date(b.executeAt).getTime()
        );

        // construit la liste des équipes depuis les games (unique)
        const map = new Map<string, string>();

        for (const g of this.games) {
          if (g.homeTeamId && g.homeTeamName) map.set(g.homeTeamId, g.homeTeamName);
          if (g.awayTeamId && g.awayTeamName) map.set(g.awayTeamId, g.awayTeamName);
        }

        this.teams = Array.from(map.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // optionnel : pré-sélectionner la première équipe
        if (!this.selectedTeamId && this.teams.length > 0) {
          this.selectedTeamId = this.teams[0].id;
        }
      },
      error: (err) => console.error(err),
    });
  }

  // Liste filtrée affichée
  get filteredGames(): SimplifiedGame[] {
    if (!this.selectedTeamId) return this.games;

    return this.games.filter(g =>
      g.homeTeamId === this.selectedTeamId || g.awayTeamId === this.selectedTeamId
    );
  }

  onMatchClick(match: SimplifiedGame): void {
    const clubId = this.sessionStore.clubId();
    const navigation = this.resolveMatchNavigation(match, clubId);

    if (!navigation) return;
    void this.router.navigate(navigation.commands, navigation.extras);
  }

  private resolveMatchNavigation(
    match: SimplifiedGame,
    clubId: string | null,
  ): { commands: string[]; extras?: NavigationExtras } | null {
    if (this.isUpcomingMatch(match) && this.isUserClubMatch(match, clubId) && (!match.gameResult || !match.gameResult.homeScore || !match.gameResult.awayScore)) {
      const gamePlanId = this.resolveGamePlanIdForUser(match, clubId);
      if (!gamePlanId) return null;
      return { commands: ['/gameplan'], extras: { queryParams: { id: gamePlanId } } };
    }

    if (!this.hasGameResult(match)) return null;

    return { commands: ['/match-summary'], extras: { queryParams: { id: match.id } } };
  }

  private isUpcomingMatch(match: SimplifiedGame): boolean {
    return new Date(match.executeAt).getTime() > Date.now();
  }

  private isUserClubMatch(match: SimplifiedGame, clubId: string | null): boolean {
    if (!clubId) return false;
    return clubId === match.homeClubID || clubId === match.awayClubID;
  }

  private resolveGamePlanIdForUser(match: SimplifiedGame, clubId: string | null): string | null {
    if (!clubId) return null;

    if (clubId === match.homeClubID) return match.homeGamePlanId ?? null;
    if (clubId === match.awayClubID) return match.awayGamePlanId ?? null;

    return null;
  }

  private hasGameResult(match: SimplifiedGame): boolean {
    return !!(match.gameResult?.homeScore && match.gameResult?.awayScore);
  }

  getScoreOrDash(boxScore?: BoxScore | null): string {
    if (!boxScore) return '-';
    return String(calculateScore(boxScore));
  }
}
