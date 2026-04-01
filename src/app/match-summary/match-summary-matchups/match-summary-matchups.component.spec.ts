import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {MatchSummaryMatchupsComponent} from './match-summary-matchups.component';
import {MatchSummaryMatchup} from '../match-summary.service';
import {Player} from '../../models/player.model';
import {DefenseType} from '../../models/zone.enum';

describe('MatchSummaryMatchupsComponent', () => {
  let component: MatchSummaryMatchupsComponent;
  let fixture: ComponentFixture<MatchSummaryMatchupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchSummaryMatchupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchSummaryMatchupsComponent);
    component = fixture.componentInstance;
  });

  it('renders a fallback card when a visitor has no assigned home defender', () => {
    component.matchups = [{visitor: buildPlayer('v1'), home: null}];
    component.defenderLabel = 'Home';
    component.defenseType = DefenseType.MAN_TO_MAN;
    fixture.detectChanges();

    const emptyCardText = fixture.debugElement.query(By.css('.card--empty')).nativeElement.textContent;

    expect(emptyCardText).toContain('Non assigne');
  });

  it('renders visitor offensive stats without free throws', () => {
    component.matchups = [{
      visitor: buildPlayer('v1', {
        tir3Pts: 61,
        tir2Pts: 62,
        ballhandling: 63,
        floater: 64,
        finitionAuCercle: 65,
        size: 66,
        lancerFranc: 99,
      }),
      home: buildPlayer('h1'),
    } satisfies MatchSummaryMatchup];
    component.attackerLabel = 'Away';
    component.defenseType = DefenseType.MAN_TO_MAN;
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

  it('renders custom team labels in the header', () => {
    component.matchups = [{visitor: buildPlayer('v1'), home: buildPlayer('h1')}];
    component.defenderLabel = 'Allauch';
    component.attackerLabel = 'Marseille';
    component.defenseType = DefenseType.MAN_TO_MAN;
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('.matchups__header')).nativeElement.textContent;

    expect(text).toContain('Allauch');
    expect(text).toContain('Marseille');
  });

  it('renders only the defense type when the defense is not man-to-man', () => {
    component.matchups = [{visitor: buildPlayer('v1'), home: buildPlayer('h1')}];
    component.defenseType = DefenseType.ZONE_2_3;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Zone 2-3');
    expect(fixture.debugElement.query(By.css('.matchups__list'))).toBeNull();
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
