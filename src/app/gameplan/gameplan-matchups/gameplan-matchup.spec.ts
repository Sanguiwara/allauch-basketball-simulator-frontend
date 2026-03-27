import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SimpleChange} from '@angular/core';
import {GameplanMatchupComponent} from './gameplan-matchup';
import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {InGamePlayer} from '../../models/ingameplayer.model';

describe('GameplanMatchupComponent', () => {
  let component: GameplanMatchupComponent;
  let fixture: ComponentFixture<GameplanMatchupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanMatchupComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplanMatchupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
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

  it('sorts pool by def ext, def poste, and speed', () => {
    const homePlayers = [
      buildPlayer('h1', {defExterieur: 70, defPoste: 40, speed: 60}),
      buildPlayer('h2', {defExterieur: 60, defPoste: 80, speed: 40}),
      buildPlayer('h3', {defExterieur: 50, defPoste: 30, speed: 90}),
    ];
    const visitors = [buildPlayer('v1'), buildPlayer('v2')];
    const plan = buildGamePlan(homePlayers, visitors);

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });

    component.setSortMode('defExtDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h1', 'h2', 'h3']);

    component.setSortMode('defPostDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h2', 'h1', 'h3']);

    component.setSortMode('speedDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h3', 'h1', 'h2']);
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
