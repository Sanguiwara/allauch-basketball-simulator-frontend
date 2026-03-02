import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GamePlan } from '../models/gameplan.model';
import { SessionStore } from '../session.store';
import { apiBaseUrl } from '../utils/api-base-url';

@Injectable({ providedIn: 'root' })
export class GamePlanApiService {
  private readonly baseUrl = apiBaseUrl;

  constructor(private http: HttpClient, private sessionStore: SessionStore) {}

  getGamePlanById(id: string): Observable<GamePlan> {
    return this.http.get<GamePlan>(`${this.baseUrl}/gameplans/${id}`);
  }

  saveGamePlan(gamePlan: GamePlan): Observable<GamePlan> {
    console.log(gamePlan);
    return this.http.post<GamePlan>(`${this.baseUrl}/gameplans`, gamePlan);
  }

  getNextGame(): Observable<GamePlan> {
    const clubId = this.sessionStore.clubId();
    return this.http.get<GamePlan>(`${this.baseUrl}/gameplans/club/${clubId}`);
  }
}
