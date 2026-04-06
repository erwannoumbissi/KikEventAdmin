import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private auth   = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expected = (route.data['permissions'] as string[]) ?? [];
    if (!expected.length) { return true; }
    if (expected.some(p => this.auth.hasPermission(p))) { return true; }
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
