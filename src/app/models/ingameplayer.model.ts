// Player minimal (à ajuster selon ton backend)
export interface Player {
  id: string; // UUID
}

export interface InGamePlayer {
  player: Player;

  // Inputs calculés
  playmakingContribution: number;
  assistWeight: number;

  // Outputs (boxscore)
  assists: number;
  points: number;

  fga: number;
  fgm: number;

  tpa: number;
  tpm: number;

  twoPa: number;
  twoPm: number;

  // Usages (final en Java -> readonly côté TS si tu veux)
  usageShoot: number;
  usageDrive: number;
  usagePost: number;
}
