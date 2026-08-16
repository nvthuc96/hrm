import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LeaveBalance, LeaveRequest, MeProfile, MonthlyAttendance } from './models';

/** Employee self-service: everything here targets the logged-in user's own data. */
@Injectable({ providedIn: 'root' })
export class MeService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/me`;

  profile(): Observable<MeProfile> {
    return this.http.get<MeProfile>(this.api);
  }

  attendance(year: number, month: number): Observable<MonthlyAttendance> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<MonthlyAttendance>(`${this.api}/attendance`, { params });
  }

  leaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.api}/leaves`);
  }

  leaveBalances(year?: number): Observable<LeaveBalance[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<LeaveBalance[]>(`${this.api}/leave-balances`, { params });
  }

  createLeave(payload: {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.api}/leaves`, payload);
  }

  cancelLeave(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.api}/leaves/${id}/cancel`, {});
  }
}
