import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserHelper } from '../helpers/user';
import { LocalStorage } from '../helpers/localStorage';
import { TOKEN_KEY } from '../../core/services/auth.service';

/**
 * Guard IsAuthenticate — vérifie token ET user en localStorage.
 * Redirige vers /login si l'un des deux est absent.
 */
export const IsAuthenticateGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = LocalStorage.getItem(TOKEN_KEY);
  const isAuth = UserHelper.isConnect() && !!token;
  if (!isAuth) {
    UserHelper.logoutUser(); // nettoyage
    return router.parseUrl('/login');
  }
  return true;
};
