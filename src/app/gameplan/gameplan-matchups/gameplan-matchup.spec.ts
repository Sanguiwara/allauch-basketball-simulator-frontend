import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SimpleChange} from '@angular/core';
import {By} from '@angular/platform-browser';
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

  it('sorts pool by defensive stats', () => {
    const homePlayers = [
      buildPlayer('h1', {defExterieur: 70, defPoste: 40, size: 85, speed: 60, basketballIqDef: 65, endurance: 55}),
      buildPlayer('h2', {defExterieur: 60, defPoste: 80, size: 75, speed: 40, basketballIqDef: 95, endurance: 45}),
      buildPlayer('h3', {defExterieur: 50, defPoste: 30, size: 65, speed: 90, basketballIqDef: 75, endurance: 99}),
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

    component.setSortMode('sizeDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h1', 'h2', 'h3']);

    component.setSortMode('defIqDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h2', 'h3', 'h1']);

    component.setSortMode('enduranceDesc');
    expect(component.ownerPool.map((p) => p.id)).toEqual(['h3', 'h1', 'h2']);
  });

  it('renders the defensive stats requested for home cards', () => {
    const homePlayers = [
      buildPlayer('h1', {
        defExterieur: 71,
        defPoste: 72,
        size: 73,
        speed: 74,
        basketballIqDef: 75,
        endurance: 76,
      }),
    ];
    const visitors = [buildPlayer('v1')];
    const plan = buildGamePlan(homePlayers, visitors);

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });
    fixture.detectChanges();

    const labels = fixture.debugElement.queryAll(By.css('.stats .label')).map((element) =>
      (element.nativeElement.textContent ?? '').trim()
    );
    const values = fixture.debugElement.queryAll(By.css('.stats .value')).map((element) =>
      (element.nativeElement.textContent ?? '').trim()
    );

    expect(labels).toContain('DEF EXT');
    expect(labels).toContain('DEF POSTE');
    expect(labels).toContain('SIZE');
    expect(labels).toContain('SPEED');
    expect(labels).toContain('DEF IQ');
    expect(labels).toContain('ENDURANCE');

    expect(values).toContain('71');
    expect(values).toContain('72');
    expect(values).toContain('73');
    expect(values).toContain('74');
    expect(values).toContain('75');
    expect(values).toContain('76');
  });

  it('renders visitor attack cards with ballhandling and size instead of free throws', () => {
    const homePlayers = [buildPlayer('h1')];
    const visitors = [
      buildPlayer('v1', {
        tir3Pts: 61,
        tir2Pts: 62,
        ballhandling: 63,
        floater: 64,
        finitionAuCercle: 65,
        size: 66,
        lancerFranc: 99,
      }),
    ];
    const plan = buildGamePlan(homePlayers, visitors);

    component.gamePlan = plan;
    component.ngOnChanges({
      gamePlan: new SimpleChange(null, plan, true),
    });
    fixture.detectChanges();

    const visitorCard = fixture.debugElement.query(By.css('.card--visitor'));
    const labels = visitorCard.queryAll(By.css('.label')).map((element) =>
      (element.nativeElement.textContent ?? '').trim()
    );
    const values = visitorCard.queryAll(By.css('.value')).map((element) =>
      (element.nativeElement.textContent ?? '').trim()
    );

    expect(labels).toContain('3PT');
    expect(labels).toContain('2PT');
    expect(labels).toContain('BALLHANDLING');
    expect(labels).toContain('FLT');
    expect(labels).toContain('RIM');
    expect(labels).toContain('SIZE');
    expect(labels).not.toContain('FT');

    expect(values).toContain('61');
    expect(values).toContain('62');
    expect(values).toContain('63');
    expect(values).toContain('64');
    expect(values).toContain('65');
    expect(values).toContain('66');
    expect(values).not.toContain('99');
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
    threePtScore: 0,
    twoPtScore: 0,
    driveScore: 0,
    minutesPlayed: 0,
    starter: false,
  };
}
