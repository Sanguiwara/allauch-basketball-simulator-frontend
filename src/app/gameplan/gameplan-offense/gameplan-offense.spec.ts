import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SimpleChange} from '@angular/core';
import {GameplanOffense} from './gameplan-offense';
import {GamePlan} from '../../models/gameplan.model';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {Player} from '../../models/player.model';

describe('GameplanOffense', () => {
  let component: GameplanOffense;
  let fixture: ComponentFixture<GameplanOffense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanOffense],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplanOffense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts players by threePtScore, twoPtScore and driveScore', () => {
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
});

function buildGamePlan(activePlayers: InGamePlayer[]): GamePlan {
  return {
    id: 'plan-1',
    ownerTeam: {} as never,
    opponentTeam: {} as never,
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
    softSkills: 0,
    leadership: 0,
    badges: [],
  };
}
