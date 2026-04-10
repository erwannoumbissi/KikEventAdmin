import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserHelper } from '../helpers/user';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticateGuard implements CanActivate {
  private readonly router = inject(Router);

  public canActivate(): boolean | UrlTree {
    if (!UserHelper.isConnect()) {
      return this.router.parseUrl('/login');
    }
    return true;
  }
}
