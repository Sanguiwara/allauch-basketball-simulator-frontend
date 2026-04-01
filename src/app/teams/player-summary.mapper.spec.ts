import { PlayerSummaryMapper } from './player-summary.mapper';
import { PlayerDTO } from './teams.api';

describe('PlayerSummaryMapper', () => {
  let mapper: PlayerSummaryMapper;

  beforeEach(() => {
    mapper = new PlayerSummaryMapper();
  });

  it('uses backend morale for player summary and team displays', () => {
    const player: PlayerDTO = {
      id: 'p1',
      name: 'John Leader',
      birthDate: 1999,
      tir3Pts: 80,
      tir2Pts: 70,
      lancerFranc: 60,
      floater: 50,
      finitionAuCercle: 40,
      speed: 55,
      ballhandling: 65,
      size: 60,
      weight: 70,
      agressivite: 45,
      defExterieur: 58,
      defPoste: 62,
      protectionCercle: 68,
      timingRebond: 72,
      agressiviteRebond: 52,
      steal: 30,
      physique: 59,
      basketballIqOff: 61,
      basketballIqDef: 63,
      passingSkills: 66,
      iq: 70,
      endurance: 57,
      solidite: 54,
      potentielSkill: 75,
      potentielPhysique: 78,
      coachability: 80,
      ego: 15,
      morale: 84,
      softSkills: 42,
      leadership: 90,
      badges: [{ id: 1, name: 'Leader', types: [] }],
    };

    const summary = mapper.toSummary(player);

    expect(summary.morale).toBe(84);
  });
});
