import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Position } from './models';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/positions`;

  list(): Observable<Position[]> {
    return this.http.get<Position[]>(this.api);
  }

  create(payload: Partial<Position>): Observable<Position> {
    return this.http.post<Position>(this.api, payload);
  }

  update(id: number, payload: Partial<Position>): Observable<Position> {
    return this.http.put<Position>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
