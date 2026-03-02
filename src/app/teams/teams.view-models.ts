export interface TeamListItemVM {
  id: string;
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

export interface TeamDetailVM {
  id: string;
  name: string;
  category: string;
  gender: string;
  players: PlayerSummaryVM[];
}
