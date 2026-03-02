import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamDTO } from './teams.api';
import { apiBaseUrl } from '../utils/api-base-url';

@Injectable({ providedIn: 'root' })
export class TeamsApiService {
  private readonly baseUrl = `${apiBaseUrl}/teams`;

  constructor(private http: HttpClient) {}

  getTeams(): Observable<TeamDTO[]> {
    return this.http.get<TeamDTO[]>(this.baseUrl);
  }

  getTeamById(id: string): Observable<TeamDTO> {
    return this.http.get<TeamDTO>(`${this.baseUrl}/${id}`);
  }
}
