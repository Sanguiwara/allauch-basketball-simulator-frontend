import {Team} from '../models/team.model';
import {PlayerProgression} from '../models/player-progression.model';

export type TrainingType =
  | 'SHOOTING'
  | 'DEFENSE'
  | 'PHYSICAL'
  | 'PLAYMAKING'
  | 'MORALE'
  | 'TACTICAL';

export interface TrainingDTO {
  id: string;
  executeAt: string;
  trainingType: TrainingType;
  team: Team;
  playerProgressions: PlayerProgression[];
}

export interface UpdateTrainingRequestDTO {
  trainingType: TrainingType;
}
