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
  threePtScore: number;
  twoPtScore: number;
  driveScore: number;

  minutesPlayed: number;

  starter:boolean;

  offensiveRebounds?: number;
  defensiveRebounds?: number;
  steals?: number;
  blocks?: number;
}
