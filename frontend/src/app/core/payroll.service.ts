import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PayrollPeriod, Payslip, SalaryComponent } from './models';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/payroll`;
  private componentApi = `${environment.apiUrl}/salary-components`;

  // ----- Periods -----
  listPeriods(): Observable<PayrollPeriod[]> {
    return this.http.get<PayrollPeriod[]>(`${this.api}/periods`);
  }

  createPeriod(month: number, year: number): Observable<PayrollPeriod> {
    return this.http.post<PayrollPeriod>(`${this.api}/periods`, { month, year });
  }

  lock(id: number): Observable<PayrollPeriod> {
    return this.http.post<PayrollPeriod>(`${this.api}/periods/${id}/lock`, {});
  }

  unlock(id: number): Observable<PayrollPeriod> {
    return this.http.post<PayrollPeriod>(`${this.api}/periods/${id}/unlock`, {});
  }

  generate(periodId: number): Observable<Payslip[]> {
    return this.http.post<Payslip[]>(`${this.api}/periods/${periodId}/generate`, {});
  }

  // ----- Payslips -----
  listPayslips(periodId: number): Observable<Payslip[]> {
    const params = new HttpParams().set('periodId', periodId);
    return this.http.get<Payslip[]>(`${this.api}/payslips`, { params });
  }

  exportPayslips(periodId: number): Observable<Blob> {
    const params = new HttpParams().set('periodId', periodId);
    return this.http.get(`${this.api}/payslips/export`, { params, responseType: 'blob' });
  }

  // ----- Salary components -----
  listComponents(): Observable<SalaryComponent[]> {
    return this.http.get<SalaryComponent[]>(this.componentApi);
  }

  createComponent(payload: Partial<SalaryComponent>): Observable<SalaryComponent> {
    return this.http.post<SalaryComponent>(this.componentApi, payload);
  }

  updateComponent(id: number, payload: Partial<SalaryComponent>): Observable<SalaryComponent> {
    return this.http.put<SalaryComponent>(`${this.componentApi}/${id}`, payload);
  }

  deleteComponent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.componentApi}/${id}`);
  }
}
