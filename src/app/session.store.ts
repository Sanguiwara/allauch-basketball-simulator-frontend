import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { apiBaseUrl } from './utils/api-base-url';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _clubId = signal<string | null>(null);
  readonly clubId = this._clubId.asReadonly();

  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();

  constructor(private http: HttpClient) {}

  loadMe(): Observable<void> {
    console.log('loadMe');
    //if (this._loaded()) return of(void 0);

    return this.http.post<string>(`${apiBaseUrl}/users/associate`, null).pipe(
      tap((clubId) => this._clubId.set(clubId)),

      tap(() => this._loaded.set(true)),
      map(() => void 0)
    );
  }
}
