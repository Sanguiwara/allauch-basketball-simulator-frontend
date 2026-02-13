import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import {CalendarApiService} from '../calendar/calendar-api.service';
import {Game} from '../models/game.model';
import {GameResult, ShootingResult} from '../models/game-result.model';
import {InGamePlayer} from '../models/ingameplayer.model';
import {calculateScore} from '../utils/game-result.utils';

export interface TeamStatRow {
  label: string;
  home: string;
  away: string;
}

export interface MatchSummaryVm {
  game: Game;
  teamStats: TeamStatRow[];
  homeActivePlayers: InGamePlayer[];
  awayActivePlayers: InGamePlayer[];
  homeScore: number;
  awayScore: number;
}

@Injectable({providedIn: 'root'})
export class MatchSummaryService {
  constructor(private calendarApi: CalendarApiService) {}

  getGameById(id: string): Observable<Game> {
    return this.calendarApi.getGameById(id);
  }

  getMatchSummary(id: string): Observable<MatchSummaryVm> {
    return this.getGameById(id).pipe(map(game => this.buildVm(game)));
  }

  buildTeamStats(gameResult: GameResult): TeamStatRow[] {
    return [
      {
        label: 'Total',
        home: String(calculateScore(gameResult.homeScore)),
        away: String(calculateScore(gameResult.awayScore)),
      },
      {
        label: '3PT',
        home: this.formatShooting(gameResult.homeScore.threePointShootingResult),
        away: this.formatShooting(gameResult.awayScore.threePointShootingResult),
      },
      {
        label: '2PT',
        home: this.formatShooting(gameResult.homeScore.twoPointShootingResult),
        away: this.formatShooting(gameResult.awayScore.twoPointShootingResult),
      },
      {
        label: 'Drive',
        home: this.formatShooting(gameResult.homeScore.driveResult),
        away: this.formatShooting(gameResult.awayScore.driveResult),
      },
    ];
  }

  private formatShooting(result: ShootingResult): string {
    const attempts = result.attempts ?? 0;
    const made = result.made ?? 0;
    const pct = attempts > 0 ? Math.round((made / attempts) * 100) : 0;
    return `${made}/${attempts} (${pct}%)`;
  }

  private buildVm(game: Game): MatchSummaryVm {
    return {
      game,
      teamStats: this.buildTeamStats(game.gameResult),
      homeActivePlayers: game.homeActivePlayers ?? [],
      awayActivePlayers: game.awayActivePlayers ?? [],
      homeScore: calculateScore(game.gameResult.homeScore),
      awayScore: calculateScore(game.gameResult.awayScore),
    };
  }
}
