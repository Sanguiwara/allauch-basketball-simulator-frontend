import {GameResult} from './game-result.model';

export interface SimplifiedGame {
  id: string;               // UUID
  executeAt: string;        // Instant (ISO-8601)
  homeGamePlanId: string;   // UUID
  awayGamePlanId: string;   // UUID
  homeTeamId: string;       // UUID
  homeTeamName: string;
  awayTeamId: string;       // UUID
  awayTeamName: string;
  homeClubID: string;       // UUID
  awayClubID: string;       // UUID
  gameResult?: GameResult | null;
}
