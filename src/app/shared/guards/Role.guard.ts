import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserHelper } from '../helpers/user';
import { LocalStorage } from '../helpers/localStorage';
import { TOKEN_KEY } from '../../core/services/auth.service';

/**
 * Guard Role — vérifie l'authentification ET le rôle requis.
 * - Sans token → /login
 * - Sans rôle requis → /unauthorized
 * Les rôles sont lus depuis AuthService (BehaviorSubject + localStorage).
 */
export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // 1. Vérifier d'abord l'authentification
  const token  = LocalStorage.getItem(TOKEN_KEY);
  const isAuth = UserHelper.isConnect() && !!token;
  if (!isAuth) {
    UserHelper.logoutUser();
    return router.parseUrl('/login');
  }

  // 2. Vérifier le rôle requis
  const expectedRoles = (route.data['roles'] as string[]) ?? [];
  if (!expectedRoles.length) { return true; }

  const hasRole = expectedRoles.some(role => auth.hasRole(role));
  if (hasRole) { return true; }

  console.warn('[RoleGuard] Accès refusé — rôles requis:', expectedRoles);
  return router.parseUrl('/unauthorized');
};
