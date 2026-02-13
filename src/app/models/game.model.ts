import {GameResult} from './game-result.model';
import {InGamePlayer} from './ingameplayer.model';

export interface Game {
  id: string;               // UUID
  executeAt: string;        // Instant (ISO-8601)
  homeGamePlanId: string;
  awayGamePlanId: string;   // UUID
  homeTeamId: string;       // UUID
  homeTeamName: string;
  awayTeamId: string;       // UUID
  awayTeamName: string;
  homeClubID: string;
  awayClubID: string;
  gameResult: GameResult;
  homeActivePlayers?: InGamePlayer[];
  awayActivePlayers?: InGamePlayer[];
}
