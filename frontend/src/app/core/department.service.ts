import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Department } from './models';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/departments`;

  list(): Observable<Department[]> {
    return this.http.get<Department[]>(this.api);
  }

  create(payload: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(this.api, payload);
  }

  update(id: number, payload: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
