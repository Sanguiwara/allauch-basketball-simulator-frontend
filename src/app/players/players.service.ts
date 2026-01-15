import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Player} from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private readonly baseUrl = 'http://localhost:8080/players';

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.baseUrl);
  }
  getPlayerById(id: number) {
    return this.http.get<Player>(`${this.baseUrl}/${id}`);
  }
}
