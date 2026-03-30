import {SimpleChange} from '@angular/core';
import '@angular/compiler';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {of} from 'rxjs';
import {
  GameplanMatchupComponent,
  getDriveDefenseScore,
  getDriveOffenseScore,
  getMatchupScores,
  getThreePtDefenseScore,
  getThreePtOffenseScore,
  getTwoPtDefenseScore,
  getTwoPtOffenseScore,
} from './gameplan-matchup';
import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {InGamePlayer} from '../../models/ingameplayer.model';

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
      finitionAuCercle: 85,
      floater: 50,
      iq: 75,
      defExterieur: 65,
      steal: 40,
      defPoste: 55,
      tir2Pts: 82,
      tir3Pts: 88,
    });

    expect(getDriveOffenseScore(player)).toBe(78.8);
    expect(getDriveDefenseScore(player)).toBe(66.4);
    expect(getTwoPtOffenseScore(player)).toBe(76);
    expect(getTwoPtDefenseScore(player)).toBe(65.2);
    expect(getThreePtOffenseScore(player)).toBe(79.8);
    expect(getThreePtDefenseScore(player)).toBe(67.8);
    expect(getMatchupScores(player)).toEqual({
      driveOffense: 78.8,
      driveDefense: 66.4,
      twoPtOffense: 76,
      twoPtDefense: 65.2,
      threePtOffense: 79.8,
      threePtDefense: 67.8,
    });
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
    softSkills: 0,
    leadership: 0,
    badges: [],
    ...overrides,
  };
}

function buildInGamePlayer(player: Player): InGamePlayer {
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
    usageShoot: 0,
    usageDrive: 0,
    usagePost: 0,
    minutesPlayed: 0,
    starter: false,
  };
}
