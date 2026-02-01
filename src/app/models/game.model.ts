export interface Game {
  id: string;               // UUID
  executeAt: string;        // Instant (ISO-8601)
  homeGamePlanId: string;   // UUID
  homeTeamId: string;       // UUID
  homeTeamName: string;
  awayTeamId: string;       // UUID
  awayTeamName: string;
}
