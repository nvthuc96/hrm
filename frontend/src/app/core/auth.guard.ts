import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

/** Chỉ cho ADMIN vào; role backend có tiền tố ROLE_ nên cần bỏ khi so. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isAdmin = (auth.currentUser()?.roles ?? []).some(
    (r) => r.replace(/^ROLE_/, '') === 'ADMIN',
  );
  if (isAdmin) {
    return true;
  }
  router.navigate(['/dashboard']);
  return false;
};
