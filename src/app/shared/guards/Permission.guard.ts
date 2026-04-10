import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserHelper } from '../helpers/user';
import { LocalStorage } from '../helpers/localStorage';
import { TOKEN_KEY } from '../../core/services/auth.service';

/**
 * Guard Permission — vérifie l'authentification ET la permission requise.
 */
export const PermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token  = LocalStorage.getItem(TOKEN_KEY);
  const isAuth = UserHelper.isConnect() && !!token;
  if (!isAuth) {
    UserHelper.logoutUser();
    return router.parseUrl('/login');
  }

  const expected = (route.data['permissions'] as string[]) ?? [];
  if (!expected.length) { return true; }

  const hasPerm = expected.some(p => auth.hasPermission(p));
  if (hasPerm) { return true; }

  return router.parseUrl('/unauthorized');
};
