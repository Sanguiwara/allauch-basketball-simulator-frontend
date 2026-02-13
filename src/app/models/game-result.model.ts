export interface GameResult {
  homeScore: BoxScore;
  awayScore: BoxScore;
}

export interface BoxScore {
  threePointShootingResult: ShootingResult;
  driveResult: ShootingResult;
  twoPointShootingResult: ShootingResult;
}

export interface ShootingResult {
  attempts: number;
  made: number;
}
