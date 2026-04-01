import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import {CalendarApiService} from '../calendar/calendar-api.service';
import {Game} from '../models/game.model';
import {GameResult, ShootingResult} from '../models/game-result.model';
import {InGamePlayer} from '../models/ingameplayer.model';
import {Player} from '../models/player.model';
import {calculateScore} from '../utils/game-result.utils';

export interface TeamStatRow {
  label: string;
  home: string;
  away: string;
}

export interface MatchSummaryVm {
  game: Game;
  teamStats: TeamStatRow[];
  homeMatchups: MatchSummaryMatchup[];
  awayMatchups: MatchSummaryMatchup[];
  homeActivePlayers: InGamePlayer[];
  awayActivePlayers: InGamePlayer[];
  homeTotals: PlayerTotals;
  awayTotals: PlayerTotals;
  homeScore: number;
  awayScore: number;
  homeProgressionPlayers: Player[];
  awayProgressionPlayers: Player[];
  homeProgressions: Game['playerProgressions'];
  awayProgressions: Game['playerProgressions'];
}

export interface MatchSummaryMatchup {
  visitor: Player;
  home: Player | null;
}

export interface PlayerTotals {
  minutesPlayed: number;
  points: number;
  assists: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  steals: number;
  blocks: number;
  fgm: number;
  fga: number;
  twoPointMade: number;
  twoPointAttempts: number;
  threePointMade: number;
  threePointAttempt: number;
  driveMade: number;
  driveAttempts: number;
  usageShoot: number;
  usageDrive: number;
  usagePost: number;
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
        label: 'Total tirs',
        home: this.formatTotalShots(gameResult.homeScore),
        away: this.formatTotalShots(gameResult.awayScore),
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

  buildPlayerTotals(players: InGamePlayer[]): PlayerTotals {
    const totals: PlayerTotals = {
      minutesPlayed: 0,
      points: 0,
      assists: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      steals: 0,
      blocks: 0,
      fgm: 0,
      fga: 0,
      twoPointMade: 0,
      twoPointAttempts: 0,
      threePointMade: 0,
      threePointAttempt: 0,
      driveMade: 0,
      driveAttempts: 0,
      usageShoot: 0,
      usageDrive: 0,
      usagePost: 0,
    };

    for (const player of players) {
      totals.minutesPlayed += player.minutesPlayed ?? 0;
      totals.points += player.points ?? 0;
      totals.assists += player.assists ?? 0;
      totals.offensiveRebounds += player.offensiveRebounds ?? 0;
      totals.defensiveRebounds += player.defensiveRebounds ?? 0;
      totals.steals += player.steals ?? 0;
      totals.blocks += player.blocks ?? 0;
      totals.fgm += player.fgm ?? 0;
      totals.fga += player.fga ?? 0;
      totals.twoPointMade += player.twoPointMade ?? 0;
      totals.twoPointAttempts += player.twoPointAttempts ?? 0;
      totals.threePointMade += player.threePointMade ?? 0;
      totals.threePointAttempt += player.threePointAttempt ?? 0;
      totals.driveMade += player.driveMade ?? 0;
      totals.driveAttempts += player.driveAttempts ?? 0;
      totals.usageShoot += player.usageShoot ?? 0;
      totals.usageDrive += player.usageDrive ?? 0;
      totals.usagePost += player.usagePost ?? 0;
    }

    return totals;
  }

  buildMatchups(
    defenders: Player[],
    attackers: Player[],
    record: Record<string, string>,
  ): MatchSummaryMatchup[] {
    const defenderById = new Map(defenders.map((player) => [player.id, player]));
    const attackerById = new Map(attackers.map((player) => [player.id, player]));

    const existingMatchups = Object.entries(record)
      .map(([defenderId, attackerId]) => {
        const home = defenderById.get(defenderId) ?? null;
        const visitor = attackerById.get(attackerId);
        return visitor ? {visitor, home} : null;
      })
      .filter((matchup): matchup is MatchSummaryMatchup => matchup !== null);

    const matchedVisitorIds = new Set(existingMatchups.map((matchup) => matchup.visitor.id));

    const remainingVisitors = attackers
      .filter((player) => !matchedVisitorIds.has(player.id))
      .map((visitor) => ({visitor, home: null}));

    return [...existingMatchups, ...remainingVisitors];
  }

  private formatTotalShots(score: GameResult['homeScore']): string {
    const threePoint = score.threePointShootingResult.attempts ?? 0;
    const twoPoint = score.twoPointShootingResult.attempts ?? 0;
    const drive = score.driveResult.attempts ?? 0;
    return String(threePoint + twoPoint + drive);
  }

  private buildVm(game: Game): MatchSummaryVm {
    const homeActivePlayers = game.homeActivePlayers ?? [];
    const awayActivePlayers = game.awayActivePlayers ?? [];
    const homePlayers = homeActivePlayers.map((player) => player.player);
    const awayPlayers = awayActivePlayers.map((player) => player.player);
    const homeProgressionPlayers = this.buildProgressionPlayers(homeActivePlayers);
    const awayProgressionPlayers = this.buildProgressionPlayers(awayActivePlayers);
    const {homeProgressions, awayProgressions} = this.buildTeamProgressions(
      game.playerProgressions ?? [],
      homeActivePlayers,
      awayActivePlayers,
    );

    return {
      game,
      teamStats: this.buildTeamStats(game.gameResult),
      homeMatchups: this.buildMatchups(homePlayers, awayPlayers, game.homeMatchups ?? {}),
      awayMatchups: this.buildMatchups(awayPlayers, homePlayers, game.awayMatchups ?? {}),
      homeActivePlayers,
      awayActivePlayers,
      homeTotals: this.buildPlayerTotals(homeActivePlayers),
      awayTotals: this.buildPlayerTotals(awayActivePlayers),
      homeScore: calculateScore(game.gameResult.homeScore),
      awayScore: calculateScore(game.gameResult.awayScore),
      homeProgressionPlayers,
      awayProgressionPlayers,
      homeProgressions,
      awayProgressions,
    };
  }

  private buildProgressionPlayers(players: InGamePlayer[]): Player[] {
    const uniquePlayers = new Map<string, Player>();
    for (const player of players) {
      if (player.player?.id) {
        uniquePlayers.set(player.player.id, player.player);
      }
    }
    return Array.from(uniquePlayers.values());
  }

  private buildTeamProgressions(
    progressions: Game['playerProgressions'],
    homePlayers: InGamePlayer[],
    awayPlayers: InGamePlayer[],
  ): {homeProgressions: Game['playerProgressions']; awayProgressions: Game['playerProgressions']} {
    const homeIds = new Set(homePlayers.map((player) => player.player?.id).filter(Boolean) as string[]);
    const awayIds = new Set(awayPlayers.map((player) => player.player?.id).filter(Boolean) as string[]);

    return {
      homeProgressions: (progressions ?? []).filter((progression) => homeIds.has(progression.playerId)),
      awayProgressions: (progressions ?? []).filter((progression) => awayIds.has(progression.playerId)),
    };
  }
}
