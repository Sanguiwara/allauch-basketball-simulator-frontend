import {Team} from './team.model';
import {Position} from './position.enum';
import {InGamePlayer} from './ingameplayer.model';

export interface GamePlan {
  id: string;          // UUID
  teamHome: Team;
  teamVisitor: Team;
  matchups?: Record<string, string>;
  positions?: Map<Position, string>;
  activePlayers?: InGamePlayer[];
}


