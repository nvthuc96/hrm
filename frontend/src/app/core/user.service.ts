import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, User } from './models';

export interface UserCreatePayload {
  username: string;
  password: string;
  roles: string[];
  employeeId?: number | null;
  enabled?: boolean;
}

export interface UserUpdatePayload {
  roles: string[];
  employeeId?: number | null;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/users`;

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  roles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.api}/roles`);
  }

  create(payload: UserCreatePayload): Observable<User> {
    return this.http.post<User>(this.api, payload);
  }

  update(id: number, payload: UserUpdatePayload): Observable<User> {
    return this.http.put<User>(`${this.api}/${id}`, payload);
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/password`, { newPassword });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
