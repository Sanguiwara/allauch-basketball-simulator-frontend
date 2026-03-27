import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersList } from './players-list';
import { Player } from '../../models/player.model';

describe('PlayersList', () => {
  let component: PlayersList;
  let fixture: ComponentFixture<PlayersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters by name with global search', () => {
    const player: Player = {
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
      softSkills: 42,
      leadership: 90,
      badges: [{id: 1, name: 'Leader', types: []}],
    };

    const predicate = component.dataSource.filterPredicate;
    expect(predicate(player, 'leader')).toBeTrue();
    expect(predicate(player, 'alex')).toBeFalse();
  });

  it('does not match when name is different', () => {
    const player: Player = {
      id: 'p2',
      name: 'Alex Defense',
      birthDate: 2001,
      tir3Pts: 10,
      tir2Pts: 20,
      lancerFranc: 30,
      floater: 40,
      finitionAuCercle: 50,
      speed: 55,
      ballhandling: 35,
      size: 40,
      weight: 45,
      agressivite: 88,
      defExterieur: 90,
      defPoste: 91,
      protectionCercle: 92,
      timingRebond: 93,
      agressiviteRebond: 94,
      steal: 95,
      physique: 60,
      basketballIqOff: 70,
      basketballIqDef: 71,
      passingSkills: 32,
      iq: 72,
      endurance: 61,
      solidite: 62,
      potentielSkill: 80,
      potentielPhysique: 81,
      coachability: 82,
      ego: 10,
      softSkills: 20,
      leadership: 25,
      badges: [{id: 2, name: 'Anchor', types: []}],
    };

    const predicate = component.dataSource.filterPredicate;
    expect(predicate(player, 'john')).toBeFalse();
  });
});
