import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { apiBaseUrl } from '../utils/api-base-url';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private readonly baseUrl = `${apiBaseUrl}/players`;

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.baseUrl);
  }
  getPlayerById(id: string) {
    console.log(id);
    return this.http.get<Player>(`${this.baseUrl}/${id}`);
  }
}
