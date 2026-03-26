export interface GameResult {
  homeScore: BoxScore;
  awayScore: BoxScore;
}

export interface BoxScore {
  threePointShootingResult: ShootingResult;
  driveResult: ShootingResult;
  twoPointShootingResult: ShootingResult;
  totalShotNumber?: number;
}

export interface ShootingResult {
  attempts: number;
  made: number;
}
