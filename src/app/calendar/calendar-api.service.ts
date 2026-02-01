import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Game} from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class CalendarApiService {
  private readonly baseUrl = 'http://localhost:8080/games';

  constructor(private http: HttpClient) {}

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}`);
  }
}
