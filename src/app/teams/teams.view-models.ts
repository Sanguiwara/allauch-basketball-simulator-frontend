export interface TeamListItemVM {
  id: string;
  clubId: string;
  name: string;
  category: string;
  gender: string;
  playerCount: number;
}

export interface PlayerSummaryVM {
  id: string;
  name: string;
  attack: number;
  defense: number;
  overall: number;
  morale: number;
  badges: string[];
}

export interface TeamStatsVM {
  threePts: number;
  twoPts: number;
  drive: number;
  defense: number;
  rebound: number;
  steal: number;
  morale: number;
}

export interface TeamDetailVM {
  id: string;
  clubId: string;
  name: string;
  category: string;
  gender: string;
  players: PlayerSummaryVM[];
  stats: TeamStatsVM;
}
