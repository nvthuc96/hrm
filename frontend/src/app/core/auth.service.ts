import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, SessionUser } from './models';

// Only non-secret identity is persisted. The access token lives in memory;
// the refresh token lives in an httpOnly cookie the browser manages for us.
const USER_KEY = 'hrm_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/auth`;

  /** Access token — in memory only, never written to storage. */
  private accessToken: string | null = null;

  readonly currentUser = signal<SessionUser | null>(this.restoreUser());

  /** Shared in-flight refresh so concurrent 401s trigger only one refresh call. */
  private refreshInFlight: Observable<AuthResponse> | null = null;

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { username, password }, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res)));
  }

  /**
   * Exchange the httpOnly refresh cookie for a new access token (rotating the
   * cookie). No body/token is sent from JS — the browser attaches the cookie.
   */
  refresh(): Observable<AuthResponse> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    this.refreshInFlight = this.http
      .post<AuthResponse>(`${this.api}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => this.setSession(res)),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay(1),
      );
    return this.refreshInFlight;
  }

  /** User-initiated logout: revoke server-side (clears cookie) then drop local state. */
  logout(): void {
    this.http
      .post(`${this.api}/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();
    this.clearSession();
  }

  /** Local-only teardown (e.g. when a refresh fails); does not call the server. */
  clearSession(): void {
    this.accessToken = null;
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  get token(): string | null {
    return this.accessToken;
  }

  get isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  /** Was there a session before this page load? Used to decide whether to silently refresh. */
  hasStoredSession(): boolean {
    return !!localStorage.getItem(USER_KEY);
  }

  private setSession(res: AuthResponse): void {
    this.accessToken = res.token;
    const user: SessionUser = { username: res.username, roles: res.roles };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private restoreUser(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  }
}
