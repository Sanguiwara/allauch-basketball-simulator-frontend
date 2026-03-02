import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

import { TrainingApiService } from './training.api';
import { TrainingDTO } from './training.models';
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

describe('TrainingApiService', () => {
  let service: TrainingApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const token = buildToken({ sub: 'auth0|user-123' });
    const authStub = { getAccessTokenSilently: () => of(token) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TrainingApiService,
        { provide: AuthService, useValue: authStub },
      ],
    });

    service = TestBed.inject(TrainingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('uses userId from token to fetch next training', () => {
    let result: TrainingDTO | null | undefined;

    service.getNextTrainingForTeam('team-1').subscribe((training) => {
      result = training;
    });

    const request = httpMock.expectOne(
      `${apiBaseUrl}/trainings/userSub/auth0|user-123/next`
    );
    expect(request.request.method).toBe('GET');

    const payload: TrainingDTO = {
      id: 'training-1',
      executeAt: '2026-02-28T10:00:00Z',
      trainingType: 'SHOOTING',
      team: {
        id: 'team-1',
        name: 'Allauch',
        ageCategory: 'SENIOR',
        gender: 'M',
        players: [],
      },
      playerProgressions: [],
    };

    request.flush(payload);
    expect(result).toEqual(payload);
  });
});
