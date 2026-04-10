import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserHelper } from '../helpers/user';
import { LocalStorage } from '../helpers/localStorage';
import { TOKEN_KEY } from '../../core/services/auth.service';

/**
 * Guard IsGuest — bloque l'accès aux pages publiques (login)
 * si l'utilisateur est déjà connecté.
 */
export const IsGuestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = LocalStorage.getItem(TOKEN_KEY);
  const isAuth = UserHelper.isConnect() && !!token;
  if (isAuth) {
    return router.parseUrl('/dashboard');
  }
  return true;
};
