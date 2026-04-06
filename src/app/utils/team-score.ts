import {InGamePlayer} from '../models/ingameplayer.model';
import {Player} from '../models/player.model';

export type TeamScoreCategory = 'drive' | 'threePt' | 'playmaking' | 'twoPt';

export type TeamScoreSummary = {
  drive: number;
  threePt: number;
  playmaking: number;
  twoPt: number;
};

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getDriveOffenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.18 +
      player.size * 0.08 +
      player.endurance * 0.05 +
      player.ballhandling * 0.2 +
      player.finitionAuCercle * 0.35 +
      player.floater * 0.1 +
      player.iq * 0.04,
  );
}

export function getStealScore(player: Player): number {
  return roundScore(
    player.speed * 0.2 +
      player.defExterieur * 0.25 +
      player.steal * 0.3 +
      player.basketballIqDef * 0.15 +
      player.endurance * 0.05 +
      player.physique * 0.05,
  );
}

export function getReboundScore(player: Player): number {
  return roundScore(
    player.size * 0.18 +
      player.weight * 0.1 +
      player.agressivite * 0.1 +
      player.agressiviteRebond * 0.18 +
      player.timingRebond * 0.18 +
      player.physique * 0.14 +
      player.iq * 0.06 +
      player.endurance * 0.06,
  );
}

export function getDriveDefenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.18 +
      player.size * 0.22 +
      player.defExterieur * 0.22 +
      player.endurance * 0.1 +
      player.iq * 0.12 +
      player.steal * 0.1 +
      player.defPoste * 0.06,
  );
}

export function getPlaymakingOffenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.15 +
      player.size * 0.05 +
      player.endurance * 0.05 +
      player.passingSkills * 0.2 +
      player.basketballIqOff * 0.25 +
      player.ballhandling * 0.15 +
      player.tir3Pts * 0.05 +
      player.tir2Pts * 0.05 +
      player.finitionAuCercle * 0.03 +
      player.floater * 0.02,
  );
}

export function getPlaymakingDefenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.15 +
      player.size * 0.08 +
      player.defExterieur * 0.42 +
      player.endurance * 0.05 +
      player.basketballIqDef * 0.15 +
      player.steal * 0.15,
  );
}

export function getTwoPtOffenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.08 +
      player.size * 0.22 +
      player.endurance * 0.12 +
      player.finitionAuCercle * 0.15 +
      player.tir2Pts * 0.28 +
      player.iq * 0.15,
  );
}

export function getTwoPtDefenseScore(player: Player): number {
  return roundScore(
    player.defPoste * 0.27 +
      player.speed * 0.1 +
      player.size * 0.28 +
      player.endurance * 0.12 +
      player.iq * 0.18 +
      player.steal * 0.05,
  );
}

export function getThreePtOffenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.1 +
      player.size * 0.15 +
      player.endurance * 0.1 +
      player.tir3Pts * 0.5 +
      player.iq * 0.15,
  );
}

export function getThreePtDefenseScore(player: Player): number {
  return roundScore(
    player.speed * 0.1 +
      player.size * 0.1 +
      player.defExterieur * 0.65 +
      player.endurance * 0.05 +
      player.iq * 0.1,
  );
}

export function getOffenseTeamScore(players: InGamePlayer[]): TeamScoreSummary {
  return {
    drive: getWeightedTeamScore(players, getDriveOffenseScore),
    threePt: getWeightedTeamScore(players, getThreePtOffenseScore),
    playmaking: getWeightedTeamScore(players, getPlaymakingOffenseScore),
    twoPt: getWeightedTeamScore(players, getTwoPtOffenseScore),
  };
}

export function getDefenseTeamScore(players: InGamePlayer[]): TeamScoreSummary {
  return {
    drive: getWeightedTeamScore(players, getDriveDefenseScore),
    threePt: getWeightedTeamScore(players, getThreePtDefenseScore),
    playmaking: getWeightedTeamScore(players, getPlaymakingDefenseScore),
    twoPt: getWeightedTeamScore(players, getTwoPtDefenseScore),
  };
}

export function getIndicativeDefenseTeamScore(players: Player[]): TeamScoreSummary {
  return {
    drive: getIndicativeTopTenAverage(players, getDriveDefenseScore),
    threePt: getIndicativeTopTenAverage(players, getThreePtDefenseScore),
    playmaking: getIndicativeTopTenAverage(players, getPlaymakingDefenseScore),
    twoPt: getIndicativeTopTenAverage(players, getTwoPtDefenseScore),
  };
}

export function getIndicativeOffenseTeamScore(players: Player[]): TeamScoreSummary {
  return {
    drive: getIndicativeTopTenAverage(players, getDriveOffenseScore),
    threePt: getIndicativeTopTenAverage(players, getThreePtOffenseScore),
    playmaking: getIndicativeTopTenAverage(players, getPlaymakingOffenseScore),
    twoPt: getIndicativeTopTenAverage(players, getTwoPtOffenseScore),
  };
}

function getWeightedTeamScore(players: InGamePlayer[], scorer: (player: Player) => number): number {
  const total = players.reduce((sum, inGamePlayer) => {
    const minutes = inGamePlayer.minutesPlayed ?? 0;
    return sum + scorer(inGamePlayer.player) * (minutes / 200);
  }, 0);

  return roundScore(total * 0.75);
}

function getIndicativeTopTenAverage(players: Player[], scorer: (player: Player) => number): number {
  if (players.length === 0) {
    return 0;
  }

  const sortedScores = players.map(scorer).sort((a, b) => b - a).slice(0, 10);
  const total = sortedScores.reduce((sum, score) => sum + score, 0);
  return roundScore(total / sortedScores.length);
}
