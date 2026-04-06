import '@angular/compiler';
import {describe, expect, it, vi} from 'vitest';
import {GameplanPlayerSelectionComponent} from './gameplan-player-selection';
import {Player} from '../../models/player.model';
import {getPlaymakingOffenseScore, getReboundScore, getStealScore} from '../../utils/team-score';

describe('GameplanPlayerSelectionComponent totals', () => {
  it('uses the shared offensive playmaking score formula', () => {
    const component = new GameplanPlayerSelectionComponent(
      {saveGamePlan: vi.fn()} as never,
      {markForCheck: vi.fn()} as never,
    );

    const player = makePlayer('p1', {
      speed: 82,
      size: 68,
      endurance: 74,
      passingSkills: 91,
      basketballIqOff: 88,
      ballhandling: 85,
      tir3Pts: 77,
      tir2Pts: 66,
      finitionAuCercle: 71,
      floater: 63,
    });

    expect(component.playmakingScore(player)).toBe(Math.round(getPlaymakingOffenseScore(player)));
  });

  it('uses the shared rebound and interception formulas', () => {
    const component = new GameplanPlayerSelectionComponent(
      {saveGamePlan: vi.fn()} as never,
      {markForCheck: vi.fn()} as never,
    );

    const player = makePlayer('p1', {
      size: 82,
      weight: 71,
      agressivite: 64,
      agressiviteRebond: 89,
      timingRebond: 77,
      physique: 74,
      iq: 68,
      endurance: 81,
      speed: 79,
      defExterieur: 72,
      steal: 88,
      basketballIqDef: 75,
    });

    expect(component.reboundScore(player)).toBe(getReboundScore(player));
    expect(component.stealScore(player)).toBe(getStealScore(player));
  });

  it('computes weighted rebound, playmaking and interception totals from minutes', () => {
    const component = new GameplanPlayerSelectionComponent(
      {saveGamePlan: vi.fn()} as never,
      {markForCheck: vi.fn()} as never,
    );

    const playerOne = makePlayer('p1', {
      size: 80,
      weight: 60,
      agressivite: 50,
      agressiviteRebond: 70,
      timingRebond: 90,
      physique: 75,
      iq: 60,
      endurance: 80,
      passingSkills: 90,
      basketballIqOff: 80,
      basketballIqDef: 70,
      speed: 60,
      defExterieur: 50,
      steal: 40,
    });
    const playerTwo = makePlayer('p2', {
      size: 50,
      weight: 50,
      agressivite: 40,
      agressiviteRebond: 60,
      timingRebond: 50,
      physique: 55,
      iq: 70,
      endurance: 60,
      passingSkills: 50,
      basketballIqOff: 60,
      basketballIqDef: 80,
      speed: 80,
      defExterieur: 85,
      steal: 90,
    });

    component.homePlayers = [playerOne, playerTwo];
    component.setChoice('p1', 'play');
    component.setChoice('p2', 'play');
    component.setMinutes('p1', 20);
    component.setMinutes('p2', 40);

    expect(component.totalReboundImpact).toBe(18);
    expect(component.totalPlaymakingImpact).toBe(19);
    expect(component.totalInterceptionImpact).toBe(22);
  });
});

function makePlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: `Player ${id}`,
    birthDate: 0,
    tir3Pts: 50,
    tir2Pts: 50,
    lancerFranc: 50,
    floater: 50,
    finitionAuCercle: 50,
    speed: 50,
    ballhandling: 50,
    size: 50,
    weight: 50,
    agressivite: 50,
    defExterieur: 50,
    defPoste: 50,
    protectionCercle: 50,
    timingRebond: 50,
    agressiviteRebond: 50,
    steal: 50,
    physique: 50,
    basketballIqOff: 50,
    basketballIqDef: 50,
    passingSkills: 50,
    iq: 50,
    endurance: 50,
    solidite: 50,
    potentielSkill: 50,
    potentielPhysique: 50,
    coachability: 50,
    ego: 50,
    morale: 50,
    softSkills: 50,
    leadership: 50,
    badges: [],
    ...overrides,
  };
}
