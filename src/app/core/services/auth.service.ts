import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Login, LoginReturnType } from '../models/auth/login.model';

import { environment } from '../../../environments/environment.development';
import { UserHelper } from '../../shared/helpers/user';
import { LocalStorage } from '../../shared/helpers/localStorage';

export interface AuthUser {
  id: number;
  name: string;
  roles: string[] | Array<{ id: number; name: string }>;
  permissions: string[] | Array<{ id: number; name: string }>;
}

/** Clé unifiée pour le token — utilisée dans login.ts ET app.interceptor.ts */
export const TOKEN_KEY = 'KIKEVENTADMIN_space_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private readonly URL = '/auth';

  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();

  login(data: Login): Observable<LoginReturnType> {
    return this.httpClient
      .post<LoginReturnType>(`${environment.apiUrl}${this.URL}/login`, data)
      .pipe(
        tap((res) => {
          if (res?.status === 200) {
            setTimeout(() => this.loadUser(), 100);
          }
        }),
        catchError((err) => throwError(() => err))
      );
  }

  logout(): void {
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * FIX #3 : loadUser() persiste le user en localStorage pour survivre au refresh.
   * Avant : le BehaviorSubject était vide après F5, IsAuthGuard redirigeait vers /login.
   */
  loadUser(): void {
    this.httpClient.get<any>(`${environment.apiUrl}/my-permissions-roles`).subscribe({
      next: (res) => {
        if (res?.status === 200) {
          this.userSubject.next(res.data as AuthUser);
          UserHelper.saveUser(res.data, LocalStorage.getItem(TOKEN_KEY));
        } else {
          this.userSubject.next(null);
        }
      },
      error: () => {
        this.userSubject.next(null);
      },
    });
  }

  /**
   * FIX #1 : hasRole() supporte les rôles objets {id, name} ET les strings.
   * Avant : le mock retournait [{id:1, name:'ADMIN'}] mais le guard comparait
   * includes('ADMIN') → false car c'est un objet, pas une string.
   */
  private resolveRoleName(r: any): string {
    return typeof r === 'string' ? r : (r?.name ?? '');
  }

  private resolvePermName(p: any): string {
    return typeof p === 'string' ? p : (p?.name ?? '');
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    if (!user?.roles) return false;
    return (user.roles as any[]).some(r =>
      this.resolveRoleName(r).trim().toLowerCase() === role.trim().toLowerCase()
    );
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    const user = this.userSubject.value;
    if (!user?.permissions) return false;
    return (user.permissions as any[]).some(p =>
      this.resolvePermName(p).trim().toLowerCase() === permission.trim().toLowerCase()
    );
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(perm));
  }
}
