import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserHelper } from '../helpers/user';

@Injectable({
  providedIn: 'root',
})
export class IsGuestGuard implements CanActivate {
  private readonly router = inject(Router);

  canActivate(): boolean | UrlTree {
    if (UserHelper.isConnect()) {
      console.info('IsGuestGuard blocked access, user already connected');
      return this.router.parseUrl('/dashboard');
    }
    return true;
  }
}
