import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TrainingDTO, TrainingType, UpdateTrainingRequestDTO } from './training.models';
import { AuthService } from '@auth0/auth0-angular';
import { apiBaseUrl } from '../utils/api-base-url';

@Injectable({ providedIn: 'root' })
export class TrainingApiService {
  private readonly baseUrl = `${apiBaseUrl}/trainings`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getNextTrainingForTeam(): Observable<TrainingDTO | null> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap((token) => {
        const sub = this.extractUserSub(token);
        return this.http.get<TrainingDTO>(`${this.baseUrl}/userSub/${sub}/next`);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }

  getTrainingsForUser(): Observable<TrainingDTO[]> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap((token) => {
        const sub = this.extractUserSub(token);
        return this.http.get<TrainingDTO[]>(`${this.baseUrl}/userSub/${sub}`);
      })
    );
  }

  getTrainingById(id: string): Observable<TrainingDTO> {
    return this.http.get<TrainingDTO>(`${this.baseUrl}/${id}`);
  }

  updateTrainingType(id: string, trainingType: TrainingType): Observable<TrainingDTO> {
    const body: UpdateTrainingRequestDTO = { trainingType };
    return this.http.put<TrainingDTO>(`${this.baseUrl}/${id}`, body);
  }

  private extractUserSub(token: string): string {
    const payload = this.decodeJwtPayload(token);
    const sub = payload['sub'];
    if (typeof sub === 'string' && sub.trim().length > 0) {
      return sub;
    }
    throw new Error('sub introuvable dans le token Auth0.');
  }

  private decodeJwtPayload(token: string): Record<string, unknown> {
    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Token Auth0 invalide.');
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '==='.slice((normalized.length + 3) % 4);

    try {
      const json = atob(padded);
      const parsed = JSON.parse(json) as Record<string, unknown>;
      return parsed ?? {};
    } catch {
      throw new Error('Impossible de lire le payload du token Auth0.');
    }
  }

}
