import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LeaveBalance, LeaveRequest, LeaveStatus, LeaveType } from './models';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/leaves`;
  private typeApi = `${environment.apiUrl}/leave-types`;

  // ----- Requests -----
  search(employeeId?: number | null, status?: LeaveStatus | null): Observable<LeaveRequest[]> {
    let params = new HttpParams();
    if (employeeId) params = params.set('employeeId', employeeId);
    if (status) params = params.set('status', status);
    return this.http.get<LeaveRequest[]>(this.api, { params });
  }

  create(payload: Partial<LeaveRequest>): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.api, payload);
  }

  approve(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.api}/${id}/approve`, {});
  }

  reject(id: number, note?: string | null): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.api}/${id}/reject`, { note: note ?? null });
  }

  cancel(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.api}/${id}/cancel`, {});
  }

  balances(employeeId: number, year?: number): Observable<LeaveBalance[]> {
    let params = new HttpParams().set('employeeId', employeeId);
    if (year) params = params.set('year', year);
    return this.http.get<LeaveBalance[]>(`${this.api}/balances`, { params });
  }

  // ----- Leave types -----
  listTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.typeApi);
  }

  createType(payload: Partial<LeaveType>): Observable<LeaveType> {
    return this.http.post<LeaveType>(this.typeApi, payload);
  }

  updateType(id: number, payload: Partial<LeaveType>): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.typeApi}/${id}`, payload);
  }

  deleteType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.typeApi}/${id}`);
  }
}
