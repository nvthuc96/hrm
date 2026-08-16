import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const RETRY_HEADER = 'X-Auth-Retry';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthCall = req.url.includes('/auth/');
      const alreadyRetried = req.headers.has(RETRY_HEADER);

      // Access token expired/invalid: try a single cookie-based refresh, then replay once.
      if (err.status === 401 && !isAuthCall && !alreadyRetried) {
        return auth.refresh().pipe(
          switchMap((res) =>
            next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${res.token}`, [RETRY_HEADER]: '1' },
              }),
            ),
          ),
          catchError((refreshErr) => {
            auth.clearSession();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      if (err.status === 401 && !isAuthCall) {
        auth.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
