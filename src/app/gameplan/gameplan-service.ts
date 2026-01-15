import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {GamePlan} from '../models/gameplan.model';


@Injectable({ providedIn: 'root' })
export class GamePlanApiService {
  // adapte l’URL à ton backend (ex: http://localhost:8080)
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}



  // Variante 2 (si tu as): GET /gameplans/{id}
  getGamePlanById(): Observable<GamePlan> {
    return this.http.get<GamePlan>(`${this.baseUrl}/gameplans/56afc092-6032-47a6-b43b-e88524e0fa25`);
  }

  saveGamePlan(gamePlan: GamePlan): Observable<GamePlan> {
    console.log(gamePlan);
    return this.http.post<GamePlan>(`${this.baseUrl}/gameplans`, gamePlan);
  }
}
