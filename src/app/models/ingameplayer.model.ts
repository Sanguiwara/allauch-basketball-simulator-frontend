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

  threePointAttempt: number;
  threePointMade: number;


  twoPointAttempts: number;
  twoPointMade: number;

  usageShoot: number;
  usageDrive: number;
  usagePost: number;

  starter:boolean;
}
