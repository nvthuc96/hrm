import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { catchError, firstValueFrom, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { AuthService } from './core/auth.service';
import { I18nPaginatorIntl } from './core/i18n/i18n-paginator-intl';

/**
 * On startup, if a session existed before the reload, silently exchange the
 * httpOnly refresh cookie for a fresh in-memory access token before routing
 * begins. Failure (expired/revoked) just clears local state → login.
 */
function initAuth(auth: AuthService): () => Promise<unknown> {
  return () => {
    if (!auth.hasStoredSession()) {
      return Promise.resolve();
    }
    return firstValueFrom(
      auth.refresh().pipe(
        catchError(() => {
          auth.clearSession();
          return of(null);
        }),
      ),
    );
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true },
    provideAnimationsAsync(),
    // Material Datepicker dùng chung cho toàn app, định dạng ngày tiếng Việt (dd/MM/yyyy).
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    { provide: MatPaginatorIntl, useClass: I18nPaginatorIntl },
  ],
};
