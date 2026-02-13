import {BoxScore} from '../models/game-result.model';

export function calculateScore(boxScore: BoxScore): number {
  return boxScore.threePointShootingResult.made * 3 +
    boxScore.twoPointShootingResult.made * 2 +
    boxScore.driveResult.made * 2;
}
