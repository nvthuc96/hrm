import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, PageResponse } from './models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/employees`;

  search(q = '', page = 0, size = 20): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('q', q ?? '');
    return this.http.get<PageResponse<Employee>>(this.api, { params });
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.api}/${id}`);
  }

  exportExcel(q = ''): Observable<Blob> {
    const params = new HttpParams().set('q', q ?? '');
    return this.http.get(`${this.api}/export`, { params, responseType: 'blob' });
  }

  create(payload: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.api, payload);
  }

  update(id: number, payload: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
