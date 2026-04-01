import { ComponentFixture, TestBed } from '@angular/core/testing';
import {SimpleChange} from '@angular/core';
import {GameplanPlayerSelectionComponent} from './gameplan-player-selection';
import {Player} from '../../models/player.model';
import {GamePlan} from '../../models/gameplan.model';
import {InGamePlayer} from '../../models/ingameplayer.model';


describe('GameplanPlayerSelection', () => {
  let component: GameplanPlayerSelectionComponent;
  let fixture: ComponentFixture<GameplanPlayerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanPlayerSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplanPlayerSelectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes overall score deterministically', () => {
    const player = makePlayer('p1', 'Alpha', {
      tir3Pts: 80,
      tir2Pts: 70,
      lancerFranc: 60,
      floater: 50,
      finitionAuCercle: 90,
      ballhandling: 70,
      passingSkills: 60,
      defExterieur: 55,
      defPoste: 65,
      protectionCercle: 75,
      timingRebond: 60,
      agressiviteRebond: 50,
      steal: 45,
      iq: 70,
      basketballIqOff: 65,
      basketballIqDef: 60,
      leadership: 50,
      coachability: 55,
      softSkills: 60,
      ego: 40,
      physique: 65,
      endurance: 70,
      solidite: 60,
      speed: 75,
    });

    const overall = component.overall(player);
    expect(overall).toBe(63);
  });

  it('sorts players by overall when sort mode is set', () => {
    const low = makePlayer('p1', 'Low', {tir3Pts: 40, tir2Pts: 40, lancerFranc: 40, floater: 40, finitionAuCercle: 40});
    const high = makePlayer('p2', 'High', {tir3Pts: 90, tir2Pts: 90, lancerFranc: 90, floater: 90, finitionAuCercle: 90});

    component.homePlayers = [low, high];
    component.setSortMode('overallDesc');
    expect(component.displayPlayers.map(p => p.id)).toEqual(['p2', 'p1']);
  });

  it('sorts players by attack/defense/playmaking', () => {
    const attack = makePlayer('p1', 'Attack', {tir3Pts: 90, tir2Pts: 90, lancerFranc: 90, floater: 90, finitionAuCercle: 90});
    const defense = makePlayer('p2', 'Defense', {defExterieur: 90, defPoste: 90, protectionCercle: 90, timingRebond: 90, agressiviteRebond: 90, steal: 90});
    const playmaking = makePlayer('p3', 'Playmaking', {passingSkills: 90, iq: 90, basketballIqOff: 90, basketballIqDef: 90});

    component.homePlayers = [attack, defense, playmaking];

    component.setSortMode('attackDesc');
    expect(component.displayPlayers[0].id).toBe('p1');

    component.setSortMode('defenseDesc');
    expect(component.displayPlayers[0].id).toBe('p2');

    component.setSortMode('playmakingDesc');
    expect(component.displayPlayers[0].id).toBe('p3');
  });

  it('sorts players by rebound/steal', () => {
    const rebounder = makePlayer('p1', 'Rebounder', {size: 90, timingRebond: 90});
    const thief = makePlayer('p2', 'Thief', {steal: 90, speed: 90});

    component.homePlayers = [rebounder, thief];

    component.setSortMode('reboundDesc');
    expect(component.displayPlayers[0].id).toBe('p1');

    component.setSortMode('stealDesc');
    expect(component.displayPlayers[0].id).toBe('p2');
  });

  it('includes steal score in overview stats', () => {
    const player = makePlayer('p1', 'Alpha', {steal: 80, speed: 80});
    const stats = component.overviewStats(player);
    const steal = stats.find(stat => stat.label === 'STL');
    expect(steal).toBeTruthy();
    expect(Number.isInteger(steal?.value ?? 0)).toBeTrue();
  });

  it('includes rebound score in overview stats', () => {
    const player = makePlayer('p1', 'Alpha', {size: 80, timingRebond: 80});
    const stats = component.overviewStats(player);
    const rebound = stats.find(stat => stat.label === 'REB');
    expect(rebound).toBeTruthy();
    expect(Number.isInteger(rebound?.value ?? 0)).toBeTrue();
  });

  it('tracks minutes and save eligibility', () => {
    const players = [
      makePlayer('p1', 'One'),
      makePlayer('p2', 'Two'),
      makePlayer('p3', 'Three'),
      makePlayer('p4', 'Four'),
      makePlayer('p5', 'Five'),
    ];
    component.homePlayers = players;

    for (const player of players) {
      component.setChoice(player.id, 'play');
      component.setMinutes(player.id, 40);
    }

    expect(component.totalSelectedMinutes).toBe(200);
    expect(component.remainingMinutes).toBe(0);
    expect(component.hasInvalidMinutes).toBeFalse();
    expect(component.canSave).toBeTrue();
  });

  it('emits active players when selection changes', () => {
    const players = [
      makePlayer('p1', 'One'),
      makePlayer('p2', 'Two'),
    ];
    const gamePlan = buildGamePlan(players);

    component.gamePlan = gamePlan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, gamePlan, true),
    });

    const emitSpy = jasmine.createSpy('emit');
    component.activePlayersChange.subscribe(emitSpy);

    component.setChoice('p1', 'play');
    component.setMinutes('p1', 30);

    const last = emitSpy.calls.mostRecent().args[0] as InGamePlayer[];
    expect(last.map((p) => p.player.id)).toEqual(['p1']);
  });
});

function makePlayer(id: string, name: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name,
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

function buildGamePlan(players: Player[]): GamePlan {
  return {
    id: 'plan-1',
    ownerTeam: {
      id: 'team-1',
      name: 'Home',
      ageCategory: 'adult',
      gender: 'M',
      players,
    },
    opponentTeam: {
      id: 'team-2',
      name: 'Away',
      ageCategory: 'adult',
      gender: 'M',
      players: [],
    },
    activePlayers: [],
    threePointAttemptShare: 0.2,
    midRangeAttemptShare: 0.2,
    driveAttemptShare: 0.2,
    totalShotNumber: 90,
    defenseType: 'man' as never,
    zoneType: null,
  };
}
