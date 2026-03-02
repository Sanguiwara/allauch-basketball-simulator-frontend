import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SimplifiedGame} from '../models/simplified-game.model';
import {Game} from '../models/game.model';
import { apiBaseUrl } from '../utils/api-base-url';

@Injectable({ providedIn: 'root' })
export class CalendarApiService {
  private readonly baseUrl = `${apiBaseUrl}/games`;

  constructor(private http: HttpClient) {}

  getGames(): Observable<SimplifiedGame[]> {
    return this.http.get<SimplifiedGame[]>(`${this.baseUrl}`);
  }

  getGameById(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.baseUrl}/${id}`);
  }
}
