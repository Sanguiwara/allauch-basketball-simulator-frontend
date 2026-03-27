import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { GamePlan } from '../models/gameplan.model';
import { apiBaseUrl } from '../utils/api-base-url';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({ providedIn: 'root' })
export class GamePlanApiService {
  private readonly baseUrl = apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getGamePlanById(id: string): Observable<GamePlan> {
    return this.http.get<GamePlan>(`${this.baseUrl}/gameplans/${id}`);
  }

  saveGamePlan(gamePlan: GamePlan): Observable<GamePlan> {
    console.log(gamePlan);
    return this.http.post<GamePlan>(`${this.baseUrl}/gameplans`, gamePlan);
  }

  getNextGame(): Observable<GamePlan> {
    return this.auth.getAccessTokenSilently().pipe(
      switchMap((token) => {
        const sub = this.extractUserSub(token);
        console.log(sub);
        return this.http.get<GamePlan>(`${this.baseUrl}/gameplans/userSub/${sub}/next`);
      })
    );
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
