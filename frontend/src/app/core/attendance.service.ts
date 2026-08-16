import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Attendance, MonthlyAttendance } from './models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/attendance`;

  monthly(employeeId: number, year: number, month: number): Observable<MonthlyAttendance> {
    const params = new HttpParams()
      .set('employeeId', employeeId)
      .set('year', year)
      .set('month', month);
    return this.http.get<MonthlyAttendance>(`${this.api}/monthly`, { params });
  }

  create(payload: Partial<Attendance>): Observable<Attendance> {
    return this.http.post<Attendance>(this.api, payload);
  }

  update(id: number, payload: Partial<Attendance>): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
