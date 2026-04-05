import '@angular/compiler';
import {SimpleChange} from '@angular/core';
import {describe, expect, it, vi} from 'vitest';
import {GameplanOffense} from './gameplan-offense';
import {GamePlan} from '../../models/gameplan.model';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {Player} from '../../models/player.model';

describe('GameplanOffense', () => {
  it('sorts players by threePtScore, twoPtScore and driveScore', () => {
    const component = createComponent();
    const playerA = buildPlayer('a', 0, 0, 0);
    const playerB = buildPlayer('b', 0, 0, 0);
    const playerC = buildPlayer('c', 0, 0, 0);

    const plan = buildGamePlan([
      buildInGamePlayer(playerA, 20, 90, 40, 50),
      buildInGamePlayer(playerB, 24, 60, 80, 40),
      buildInGamePlayer(playerC, 18, 70, 50, 95),
    ]);

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    component.setSortMode('threePtScoreDesc');
    expect(component.displayPlayers.map((p) => p.player.id)).toEqual(['a', 'c', 'b']);

    component.setSortMode('twoPtScoreDesc');
    expect(component.displayPlayers.map((p) => p.player.id)).toEqual(['b', 'c', 'a']);

    component.setSortMode('driveScoreDesc');
    expect(component.displayPlayers.map((p) => p.player.id)).toEqual(['c', 'a', 'b']);
  });

  it('computes usage totals and remaining values', () => {
    const component = createComponent();
    const playerA = buildPlayer('a', 0, 0, 0);
    const playerB = buildPlayer('b', 0, 0, 0);

    const activePlayers = [
      {...buildInGamePlayer(playerA, 20), usageDrive: 30, usageShoot: 10, usagePost: 0},
      {...buildInGamePlayer(playerB, 18), usageDrive: 20, usageShoot: 15, usagePost: 40},
    ];

    const plan = buildGamePlan(activePlayers);
    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    expect(component.totalUsageDrive).toBe(50);
    expect(component.totalUsageShoot).toBe(25);
    expect(component.totalUsagePost).toBe(40);
    expect(component.remainingUsageDrive).toBe(50);
    expect(component.remainingUsageShoot).toBe(75);
    expect(component.remainingUsagePost).toBe(60);
  });

  it('exposes opponent defenders with rotating defense views', () => {
    const component = createComponent();
    const defender = buildPlayer('d1', 88, 82, 0);
    defender.speed = 80;
    defender.size = 70;
    defender.endurance = 60;
    defender.defExterieur = 65;
    defender.defPoste = 55;
    defender.basketballIqDef = 68;
    defender.iq = 75;
    defender.steal = 40;

    const plan = buildGamePlan([]);
    plan.opponentTeam = {
      id: 'team-2',
      name: 'Away',
      ageCategory: 'adult',
      gender: 'M',
      players: [defender],
    } as never;

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    expect(component.opponentPlayers.map((player) => player.id)).toEqual(['d1']);
    expect(component.getDefensiveView(defender.id)).toBe('all');
    expect(component.defensiveDetails(defender, 'all')).toEqual([
      {label: 'DR DEF', value: 66.4},
      {label: 'PLAY DEF', value: 64.1},
      {label: '2PT DEF', value: 65.2},
      {label: '3PT DEF', value: 67.8},
    ]);

    component.cycleDefensiveView(defender.id, 1);
    expect(component.getDefensiveView(defender.id)).toBe('drive');
    component.cycleDefensiveView(defender.id, -1);
    expect(component.getDefensiveView(defender.id)).toBe('all');
  });

  it('sorts opponent defenders by defensive scores and can collapse the sidebar', () => {
    const component = createComponent();
    const driveDefender = buildPlayer('d1', 0, 0, 0);
    driveDefender.speed = 90;
    driveDefender.size = 85;
    driveDefender.defExterieur = 40;
    driveDefender.defPoste = 80;
    driveDefender.endurance = 70;
    driveDefender.iq = 75;
    driveDefender.steal = 60;

    const threePtDefender = buildPlayer('d2', 0, 0, 0);
    threePtDefender.speed = 70;
    threePtDefender.size = 60;
    threePtDefender.defExterieur = 95;
    threePtDefender.defPoste = 40;
    threePtDefender.endurance = 60;
    threePtDefender.iq = 70;
    threePtDefender.steal = 50;
    threePtDefender.basketballIqDef = 88;

    const plan = buildGamePlan([]);
    plan.opponentTeam = {
      id: 'team-2',
      name: 'Away',
      ageCategory: 'adult',
      gender: 'M',
      players: [driveDefender, threePtDefender],
    } as never;

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    component.setOpponentSortMode('threePtDesc');
    expect(component.displayOpponentPlayers.map((player) => player.id)).toEqual(['d2', 'd1']);

    component.setOpponentSortMode('driveDesc');
    expect(component.displayOpponentPlayers.map((player) => player.id)).toEqual(['d1', 'd2']);

    expect(component.isOpponentSidebarCollapsed).toBe(false);
    component.toggleOpponentSidebar();
    expect(component.isOpponentSidebarCollapsed).toBe(true);
  });

  it('computes indicative opponent defense team score from top scores', () => {
    const component = createComponent();
    const defender = buildPlayer('d1', 0, 0, 0);
    defender.speed = 80;
    defender.size = 70;
    defender.endurance = 60;
    defender.defExterieur = 65;
    defender.defPoste = 55;
    defender.basketballIqDef = 68;
    defender.iq = 75;
    defender.steal = 40;

    const plan = buildGamePlan([]);
    plan.opponentTeam = {
      id: 'team-2',
      name: 'Away',
      ageCategory: 'adult',
      gender: 'M',
      players: [defender],
    } as never;

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    expect(component.opponentDefenseTeamScore.drive).toBe(66.4);
    expect(component.opponentDefenseTeamScore.playmaking).toBe(64.1);
  });
});

function createComponent(): GameplanOffense {
  return new GameplanOffense(
    {saveGamePlan: vi.fn()} as never,
    {markForCheck: vi.fn()} as never,
  );
}

function buildGamePlan(activePlayers: InGamePlayer[]): GamePlan {
  return {
    id: 'plan-1',
    ownerTeam: {players: []} as never,
    opponentTeam: {players: []} as never,
    activePlayers,
    threePointAttemptShare: 0.2,
    midRangeAttemptShare: 0.2,
    driveAttemptShare: 0.2,
    totalShotNumber: 90,
    defenseType: 'man' as never,
    zoneType: null,
  };
}

function buildInGamePlayer(
  player: Player,
  minutesPlayed: number,
  threePtScore = 0,
  twoPtScore = 0,
  driveScore = 0,
): InGamePlayer {
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
    threePtScore,
    twoPtScore,
    driveScore,
    minutesPlayed,
    starter: false,
  };
}

function buildPlayer(id: string, tir3Pts: number, tir2Pts: number, finitionAuCercle: number): Player {
  return {
    id,
    name: `Player ${id}`,
    birthDate: 0,
    tir3Pts,
    tir2Pts,
    lancerFranc: 0,
    floater: 0,
    finitionAuCercle,
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
  };
}
