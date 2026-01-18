import {Player} from './player.model';


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

  usageShoot: number;
  usageDrive: number;
  usagePost: number;

  starter:boolean;
}
