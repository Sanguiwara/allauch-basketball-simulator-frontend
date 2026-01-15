import {Player} from './player.model';

export interface Team {
  id: string;          // UUID côté backend
  name?: string;
  ageCategory: string;
  gender: string;
  players: Player[];
}
