import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SimpleChange} from '@angular/core';
import {GameplanMinutesPlayedComponent} from './gameplan-minutes-played';
import {GamePlan} from '../../models/gameplan.model';
import {DefenseType} from '../../models/zone.enum';

describe('GameplanMinutesPlayedComponent', () => {
  let component: GameplanMinutesPlayedComponent;
  let fixture: ComponentFixture<GameplanMinutesPlayedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanMinutesPlayedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameplanMinutesPlayedComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should compute totals and save eligibility', () => {
    const gamePlan: GamePlan = {
      id: 'gp1',
      ownerTeam: {id: 't1', name: 'Home', players: []} as never,
      opponentTeam: {id: 't2', name: 'Away', players: []} as never,
      activePlayers: [
        {
          player: {
            id: 'p1',
            name: 'Player 1',
            birthDate: 0,
            tir3Pts: 60,
            tir2Pts: 65,
            lancerFranc: 70,
            floater: 60,
            finitionAuCercle: 68,
            speed: 70,
            ballhandling: 60,
            size: 60,
            weight: 60,
            agressivite: 60,
            defExterieur: 55,
            defPoste: 50,
            protectionCercle: 45,
            timingRebond: 50,
            agressiviteRebond: 50,
            steal: 50,
            physique: 60,
            basketballIqOff: 60,
            basketballIqDef: 60,
            passingSkills: 58,
            iq: 60,
            endurance: 60,
            solidite: 60,
            potentielSkill: 60,
            potentielPhysique: 60,
            coachability: 60,
            ego: 60,
            softSkills: 60,
            leadership: 60,
            badges: [],
          },
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
          minutesPlayed: 200,
          starter: true,
        },
      ],
      threePointAttemptShare: 0.3,
      midRangeAttemptShare: 0.3,
      driveAttemptShare: 0.4,
      totalShotNumber: 80,
      defenseType: DefenseType.MAN_TO_MAN,
      zoneType: null,
    };

    component.gamePlan = gamePlan;
    component.ngOnChanges({gamePlan: new SimpleChange(null, gamePlan, true)});

    expect(component.totalSelectedMinutes).toBe(200);
    expect(component.remainingMinutes).toBe(0);
    expect(component.canSave).toBeTrue();
  });
});
