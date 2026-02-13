import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {GamePlan} from '../models/gameplan.model';
import {SessionStore} from '../session.store';


@Injectable({ providedIn: 'root' })
export class GamePlanApiService {
  // adapte l’URL à ton backend (ex: http://localhost:8080)
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient,  private sessionStore: SessionStore) {}



  // Variante 2 (si tu as): GET /gameplans/{id}
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
