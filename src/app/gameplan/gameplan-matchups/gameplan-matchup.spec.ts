import {SimpleChange} from '@angular/core';
import '@angular/compiler';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {of} from 'rxjs';
import {
  GameplanMatchupComponent,
  getMatchupScores,
} from './gameplan-matchup';
import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {
  getDriveDefenseScore,
  getDriveOffenseScore,
  getPlaymakingDefenseScore,
  getPlaymakingOffenseScore,
  getThreePtDefenseScore,
  getThreePtOffenseScore,
  getTwoPtDefenseScore,
  getTwoPtOffenseScore,
} from '../../utils/team-score';

describe('GameplanMatchupComponent', () => {
  let component: GameplanMatchupComponent;

  beforeEach(() => {
    component = new GameplanMatchupComponent(
      {saveGamePlan: vi.fn(() => of(null))} as never,
      {markForCheck: vi.fn()} as never,
    );
  });

  it('filters home players based on active selection', () => {
    const homePlayers = [buildPlayer('h1'), buildPlayer('h2')];
    const visitors = [buildPlayer('v1'), buildPlayer('v2')];
    const plan = buildGamePlan(homePlayers, visitors);
    const activePlayers = [buildInGamePlayer(homePlayers[1])];

    component.gamePlan = plan;
    component.activePlayers = activePlayers;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
      activePlayers: new SimpleChange(null, activePlayers, true),
    });

    expect(component.ownerPlayers.map((p) => p.id)).toEqual(['h2']);
  });

  it('sorts pool by drive, 2pt, and 3pt defense scores', () => {
    const homePlayers = [
      buildPlayer('h1', {speed: 90, size: 65, endurance: 70, defExterieur: 55, defPoste: 40, iq: 60, steal: 85}),
      buildPlayer('h2', {speed: 50, size: 88, endurance: 70, defExterieur: 45, defPoste: 92, iq: 72, steal: 35}),
      buildPlayer('h3', {speed: 62, size: 58, endurance: 74, defExterieur: 94, defPoste: 38, iq: 68, steal: 40}),
    ];
    const visitors = [buildPlayer('v1'), buildPlayer('v2')];
    const plan = buildGamePlan(homePlayers, visitors);

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    component.setSortMode('driveDefenseDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h1', 'h3', 'h2']);

    component.setSortMode('twoPtDefenseDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h2', 'h1', 'h3']);

    component.setSortMode('threePtDefenseDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h3', 'h1', 'h2']);
  });

  it('computes drive, 2pt and 3pt offense and defense scores', () => {
    const player = buildPlayer('p1', {
      speed: 80,
      size: 70,
      endurance: 60,
      ballhandling: 90,
      passingSkills: 77,
      finitionAuCercle: 85,
      floater: 50,
      basketballIqOff: 83,
      basketballIqDef: 68,
      iq: 75,
      defExterieur: 65,
      steal: 40,
      defPoste: 55,
      tir2Pts: 82,
      tir3Pts: 88,
    });

    expect(getDriveOffenseScore(player)).toBe(78.8);
    expect(getDriveDefenseScore(player)).toBe(66.4);
    expect(getPlaymakingOffenseScore(player)).toBe(80.2);
    expect(getPlaymakingDefenseScore(player)).toBe(64.1);
    expect(getTwoPtOffenseScore(player)).toBe(76);
    expect(getTwoPtDefenseScore(player)).toBe(65.2);
    expect(getThreePtOffenseScore(player)).toBe(79.8);
    expect(getThreePtDefenseScore(player)).toBe(67.8);
    expect(getMatchupScores(player)).toEqual({
      driveOffense: 78.8,
      driveDefense: 66.4,
      playmakingOffense: 80.2,
      playmakingDefense: 64.1,
      twoPtOffense: 76,
      twoPtDefense: 65.2,
      threePtOffense: 79.8,
      threePtDefense: 67.8,
    });
  });

  it('cycles offensive and defensive views and exposes the expected raw stats', () => {
    const player = buildPlayer('p1', {
      speed: 80,
      size: 70,
      endurance: 60,
      ballhandling: 90,
      passingSkills: 77,
      finitionAuCercle: 85,
      floater: 50,
      basketballIqOff: 83,
      basketballIqDef: 68,
      iq: 75,
      defExterieur: 65,
      steal: 40,
      defPoste: 55,
      tir2Pts: 82,
      tir3Pts: 88,
    });

    expect(component.getOffensiveView(player.id)).toBe('all');
    component.cycleOffensiveView(player.id, 1);
    expect(component.getOffensiveView(player.id)).toBe('drive');
    component.cycleOffensiveView(player.id, 1);
    expect(component.getOffensiveView(player.id)).toBe('threePt');
    component.cycleOffensiveView(player.id, 1);
    expect(component.getOffensiveView(player.id)).toBe('playmaking');
    expect(component.offensiveDetails(player, component.getOffensiveView(player.id))).toEqual([
      {label: 'SPD', value: 80},
      {label: 'SIZE', value: 70},
      {label: 'END', value: 60},
      {label: 'PASS', value: 77},
      {label: 'IQ OFF', value: 83},
      {label: 'HANDLE', value: 90},
      {label: '3PT', value: 88},
      {label: '2PT', value: 82},
      {label: 'FIN', value: 85},
      {label: 'FLOAT', value: 50},
    ]);

    expect(component.offensiveDetails(player, 'all')).toEqual([
      {label: 'DR OFF', value: 78.8},
      {label: 'PLAY OFF', value: 80.2},
      {label: '2PT OFF', value: 76},
      {label: '3PT OFF', value: 79.8},
    ]);

    expect(component.getDefensiveView(player.id)).toBe('all');
    component.cycleDefensiveView(player.id, -1);
    expect(component.getDefensiveView(player.id)).toBe('twoPt');
    expect(component.defensiveDetails(player, 'all')).toEqual([
      {label: 'DR DEF', value: 66.4},
      {label: 'PLAY DEF', value: 64.1},
      {label: '2PT DEF', value: 65.2},
      {label: '3PT DEF', value: 67.8},
    ]);
    expect(component.defensiveDetails(player, component.getDefensiveView(player.id))).toEqual([
      {label: 'DEF POST', value: 55},
      {label: 'SPD', value: 80},
      {label: 'SIZE', value: 70},
      {label: 'END', value: 60},
      {label: 'IQ', value: 75},
      {label: 'STL', value: 40},
    ]);
  });

  it('computes defense team score from active player minutes and indicative offense score for opponents', () => {
    const homePlayers = [buildPlayer('h1', {speed: 80, size: 70, endurance: 60, defExterieur: 65, defPoste: 55, iq: 75, steal: 40})];
    const visitors = [buildPlayer('v1', {speed: 80, size: 70, endurance: 60, ballhandling: 90, finitionAuCercle: 85, floater: 50, iq: 75, tir2Pts: 82, tir3Pts: 88, passingSkills: 77, basketballIqOff: 83})];
    const plan = buildGamePlan(homePlayers, visitors);

    component.gamePlan = plan;
    component.activePlayers = [buildInGamePlayer(homePlayers[0], {minutesPlayed: 20})];
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
      activePlayers: new SimpleChange(null, component.activePlayers, true),
    });

    expect(component.homeDefenseTeamScore.drive).toBe(5);
    expect(component.homeDefenseTeamScore.playmaking).toBe(4);
    expect(component.visitorOffenseTeamScore.drive).toBe(78.8);
    expect(component.visitorOffenseTeamScore.threePt).toBe(79.8);
  });
});

function buildGamePlan(homePlayers: Player[], visitors: Player[]): GamePlan {
  return {
    id: 'plan-1',
    ownerTeam: {
      id: 'team-1',
      name: 'Home',
      ageCategory: 'adult',
      gender: 'M',
      players: homePlayers,
    },
    opponentTeam: {
      id: 'team-2',
      name: 'Away',
      ageCategory: 'adult',
      gender: 'M',
      players: visitors,
    },
    matchups: {},
    activePlayers: [],
    threePointAttemptShare: 0.2,
    midRangeAttemptShare: 0.2,
    driveAttemptShare: 0.2,
    totalShotNumber: 90,
    defenseType: 'man' as never,
    zoneType: null,
  };
}

function buildPlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: `Player ${id}`,
    birthDate: 0,
    tir3Pts: 0,
    tir2Pts: 0,
    lancerFranc: 0,
    floater: 0,
    finitionAuCercle: 0,
    speed: 0,
    ballhandling: 0,
    size: 0,
    weight: 0,
    agressivite: 0,
    defExterieur: 0,
    defPoste: 0,
    protectionCercle: 0,
    timingRebond: 0,
    agressiviteRebond: 0,
    steal: 0,
    physique: 0,
    basketballIqOff: 0,
    basketballIqDef: 0,
    passingSkills: 0,
    iq: 0,
    endurance: 0,
    solidite: 0,
    potentielSkill: 0,
    potentielPhysique: 0,
    coachability: 0,
    ego: 0,
    morale: 0,
    softSkills: 0,
    leadership: 0,
    badges: [],
    ...overrides,
  };
}

function buildInGamePlayer(player: Player, overrides: Partial<InGamePlayer> = {}): InGamePlayer {
  return {
    player,
    playmakingContribution: 0,
    assistWeight: 0,
    assists: 0,
    points: 0,
    fga: 0,
    fgm: 0,
    threePointAttempt: 0,
    threePointMade: 0,
    twoPointAttempts: 0,
    twoPointMade: 0,
    driveAttempts: 0,
    driveMade: 0,
    usageShoot: 0,
    usageDrive: 0,
    usagePost: 0,
    threePtScore: 0,
    twoPtScore: 0,
    driveScore: 0,
    minutesPlayed: 0,
    starter: false,
    ...overrides,
  };
}
