import {Player} from '../models/player.model';

export type PlayerDTO = Player;

export interface TeamDTO {
  id: string;
  name: string;
  category?: string;
  ageCategory?: string;
  gender: string;
  clubId: string;
  players: PlayerDTO[];
}
