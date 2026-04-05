import '@angular/compiler';
import {describe, expect, it} from 'vitest';

import {MatchSummaryMatchupsComponent} from './match-summary-matchups.component';
import {Player} from '../../models/player.model';
import {DefenseType} from '../../models/zone.enum';
import {InGamePlayer} from '../../models/ingameplayer.model';

describe('MatchSummaryMatchupsComponent', () => {
  it('uses the summary view by default for attacker and defender', () => {
    const component = new MatchSummaryMatchupsComponent();
    const player = buildPlayer('p1');

    expect(component.getOffensiveView(player.id)).toBe('all');
    expect(component.getDefensiveView(player.id)).toBe('all');
  });

  it('cycles attacker and defender views and exposes matching stat groups', () => {
    const component = new MatchSummaryMatchupsComponent();
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

    component.cycleOffensiveView(player.id, 1);
    component.cycleOffensiveView(player.id, 1);
    expect(component.getOffensiveView(player.id)).toBe('threePt');

    component.cycleDefensiveView(player.id, -1);
    expect(component.getDefensiveView(player.id)).toBe('twoPt');

    expect(component.offensiveDetails(player, 'all')).toEqual([
      {label: 'DR OFF', value: 78.8},
      {label: 'PLAY OFF', value: 80.2},
      {label: '2PT OFF', value: 76},
      {label: '3PT OFF', value: 79.8},
    ]);
    expect(component.defensiveDetails(player, 'all')).toEqual([
      {label: 'DR DEF', value: 66.4},
      {label: 'PLAY DEF', value: 64.1},
      {label: '2PT DEF', value: 65.2},
      {label: '3PT DEF', value: 67.8},
    ]);
  });

  it('returns readable defense labels', () => {
    const component = new MatchSummaryMatchupsComponent();

    component.defenseType = DefenseType.ZONE_2_3;
    expect(component.isManToMan).toBe(false);
    expect(component.defenseTypeLabel).toBe('Zone 2-3');

    component.defenseType = DefenseType.MAN_TO_MAN;
    expect(component.isManToMan).toBe(true);
    expect(component.defenseTypeLabel).toBe('Man-to-man');
  });

  it('computes weighted team scores when minutes are available', () => {
    const component = new MatchSummaryMatchupsComponent();
    const defender = buildPlayer('d1', {
      speed: 80,
      size: 70,
      endurance: 60,
      defExterieur: 65,
      defPoste: 55,
      basketballIqDef: 68,
      iq: 75,
      steal: 40,
    });
    const attacker = buildPlayer('a1', {
      speed: 80,
      size: 70,
      endurance: 60,
      ballhandling: 90,
      passingSkills: 77,
      basketballIqOff: 83,
      tir3Pts: 88,
      tir2Pts: 82,
      finitionAuCercle: 85,
      floater: 50,
      iq: 75,
    });

    component.defenders = [buildInGamePlayer(defender, 20)];
    component.attackers = [buildInGamePlayer(attacker, 40)];

    expect(component.defenderTeamScore.drive).toBe(5);
    expect(component.defenderTeamScore.playmaking).toBe(4.8);
    expect(component.attackerTeamScore.drive).toBe(11.8);
    expect(component.attackerTeamScore.threePt).toBe(12);
  });
});

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

function buildInGamePlayer(player: Player, minutesPlayed: number): InGamePlayer {
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
    minutesPlayed,
    starter: false,
  };
}
