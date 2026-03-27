import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

import { GamePlanApiService } from './gameplan-service';
import { GamePlan } from '../models/gameplan.model';
import { DefenseType } from '../models/zone.enum';
import { apiBaseUrl } from '../utils/api-base-url';

function base64UrlEncode(value: string): string {
  const base64 = btoa(value);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function buildToken(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.`;
}

describe('GamePlanApiService', () => {
  let service: GamePlanApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const token = buildToken({ sub: 'auth0|user-123' });
    const authStub = { getAccessTokenSilently: () => of(token) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GamePlanApiService,
        { provide: AuthService, useValue: authStub },
      ],
    });

    service = TestBed.inject(GamePlanApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('uses user sub from token to fetch next gameplan', () => {
    let result: GamePlan | undefined;

    service.getNextGame().subscribe((gameplan) => {
      result = gameplan;
    });

    const request = httpMock.expectOne(
      `${apiBaseUrl}/gameplans/userSub/auth0|user-123/next`
    );
    expect(request.request.method).toBe('GET');

    const payload: GamePlan = {
      id: 'gameplan-1',
      ownerTeam: {
        id: 'team-1',
        name: 'Allauch',
        ageCategory: 'SENIOR',
        gender: 'M',
        players: [],
      },
      opponentTeam: {
        id: 'team-2',
        name: 'Marseille',
        ageCategory: 'SENIOR',
        gender: 'M',
        players: [],
      },
      threePointAttemptShare: 0.35,
      midRangeAttemptShare: 0.25,
      driveAttemptShare: 0.4,
      totalShotNumber: 75,
      defenseType: DefenseType.MAN_TO_MAN,
      zoneType: null,
    };

    request.flush(payload);
    expect(result).toEqual(payload);
  });
});
