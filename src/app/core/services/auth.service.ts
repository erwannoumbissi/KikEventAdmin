import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Login, LoginReturnType } from '../models/auth/login.model';
import { RegisterRequest } from '../models/auth/register-request.model';

import { environment } from '../../../environments/environment';
import { UserHelper } from '../../shared/helpers/user';
import { LocalStorage } from '../../shared/helpers/localStorage';
import { OrganizerRequest } from '../models/organizer/organizer.model';
import { ChangePasswordRequest, SubmitOrganizerRequest, UserProfile, UpdateProfileRequest } from '../models/admin/admin-dto.model';
import { ResponseType as IResponseType } from '../models/api_resp.model';
import {
  normalizeBaseResponse,
  normalizeOrganizerRequest,
  normalizeUserProfile
} from '../adapters/api-normalizers';

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

  constructor() {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.userSubject.next(storedUser);
    }
  }

  login(data: Login): Observable<LoginReturnType> {
    return this.httpClient
      .post<LoginReturnType>(`${environment.apiUrl}${this.URL}/login`, data)
      .pipe(
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
  loadUser(): Observable<AuthUser | null> {
    return this.httpClient.get<IResponseType<AuthUser>>(`${environment.apiUrl}/me`).pipe(
      map(res => normalizeBaseResponse<AuthUser>(res, (data: any) => data as AuthUser)),
      tap((res) => {
        if (res?.status === 200) {
          this.userSubject.next(res.data as AuthUser);
          UserHelper.saveUser(res.data, LocalStorage.getItem(TOKEN_KEY));
        } else {
          const storedUser = this.getStoredUser();
          this.userSubject.next(storedUser);
        }
      }),
      map((res) => {
        if (res?.status === 200) {
          return res.data as AuthUser;
        }
        return this.getStoredUser();
      }),
      catchError(() => {
        const storedUser = this.getStoredUser();
        this.userSubject.next(storedUser);
        return of(storedUser);
      })
    );
  }

  private getStoredUser(): AuthUser | null {
    const stored = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
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
    const user = this.userSubject.value ?? this.getStoredUser();
    if (!user?.roles) return false;
    return (user.roles as any[]).some(r =>
      this.resolveRoleName(r).trim().toLowerCase() === role.trim().toLowerCase()
    );
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    const user = this.userSubject.value ?? this.getStoredUser();
    if (!user?.permissions) return false;
    return (user.permissions as any[]).some(p =>
      this.resolvePermName(p).trim().toLowerCase() === permission.trim().toLowerCase()
    );
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(perm));
  }

  // ─────────────────────────────────────────────
  // AUTH ENDPOINTS
  // ─────────────────────────────────────────────

  /** POST /auth/register - Inscription */
  register(data: RegisterRequest): Observable<IResponseType<any>> {
    return this.httpClient.post<IResponseType<any>>(
      `${environment.apiUrl}${this.URL}/register`,
      data
    ).pipe(
      map(res => normalizeBaseResponse<any>(res, d => d)),
      catchError((err) => throwError(() => err))
    );
  }

  /** GET /auth/google - Démarrer l'authentification Google */
  startGoogleAuth(): Observable<IResponseType<{ authUrl: string }>> {
    return this.httpClient.get<IResponseType<{ authUrl: string }>>(
      `${environment.apiUrl}${this.URL}/google`
    ).pipe(
      map(res => normalizeBaseResponse<{ authUrl: string }>(res, d => d as { authUrl: string }))
    );
  }

  // ─────────────────────────────────────────────
  // USER SELF-SERVICE
  // ─────────────────────────────────────────────

  /** GET /me - Récupérer mes informations */
  getMyInfo(): Observable<IResponseType<AuthUser>> {
    return this.httpClient.get<IResponseType<AuthUser>>(`${environment.apiUrl}/me`).pipe(
      map(res => normalizeBaseResponse<AuthUser>(res, (d: any) => d as AuthUser))
    );
  }

  /** PATCH /me/password - Changer mon mot de passe */
  changePassword(data: ChangePasswordRequest): Observable<IResponseType<any>> {
    return this.httpClient.patch<IResponseType<any>>(
      `${environment.apiUrl}/me/password`,
      data
    ).pipe(
      map(res => normalizeBaseResponse<any>(res, d => d)),
      catchError((err) => throwError(() => err))
    );
  }

  // ─────────────────────────────────────────────
  // ORGANIZER REQUESTS (SELF-SERVICE)
  // ─────────────────────────────────────────────

  /** GET /organiser/request - Récupérer ma demande organizer */
  getMyOrganizerRequest(): Observable<IResponseType<OrganizerRequest>> {
    return this.httpClient.get<IResponseType<OrganizerRequest>>(
      `${environment.apiUrl}/organiser/request`
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeOrganizerRequest))
    );
  }

  /** POST /organiser/request - Soumettre une demande organizer */
  submitOrganizerRequest(data: SubmitOrganizerRequest): Observable<IResponseType<OrganizerRequest>> {
    return this.httpClient.post<IResponseType<OrganizerRequest>>(
      `${environment.apiUrl}/organiser/request`,
      data
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeOrganizerRequest)),
      catchError((err) => throwError(() => err))
    );
  }

  // ─────────────────────────────────────────────
  // PROFILES (SELF-SERVICE)
  // ─────────────────────────────────────────────

  /** GET /profiles/me - Récupérer mon profil */
  getMyProfile(): Observable<IResponseType<UserProfile>> {
    return this.httpClient.get<IResponseType<UserProfile>>(
      `${environment.apiUrl}/profiles/me`
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUserProfile)),
      catchError((err) => {
        // Fallback de compatibilité: certains déploiements n'exposent pas /profiles/me
        if (err?.status === 404) {
          return this.getMyInfo().pipe(
            switchMap((meRes) => {
              const userId = Number((meRes?.data as any)?.id);
              if (!userId) {
                return of({
                  status: 200,
                  message: 'Profil non disponible sur ce backend',
                  data: normalizeUserProfile({})
                } as IResponseType<UserProfile>);
              }
              return this.httpClient.get<IResponseType<UserProfile>>(
                `${environment.apiUrl}/admin/profiles/${userId}`
              ).pipe(
                map((res) => normalizeBaseResponse(res, normalizeUserProfile)),
                catchError((adminErr) => {
                  if (adminErr?.status === 404) {
                    return of({
                      status: 200,
                      message: 'Profil non disponible sur ce backend',
                      data: normalizeUserProfile({ userId })
                    } as IResponseType<UserProfile>);
                  }
                  return throwError(() => adminErr);
                })
              );
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  /** PUT /profiles/me - Mettre à jour mon profil */
  updateMyProfile(data: UpdateProfileRequest): Observable<IResponseType<UserProfile>> {
    return this.httpClient.put<IResponseType<UserProfile>>(
      `${environment.apiUrl}/profiles/me`,
      data
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUserProfile)),
      catchError((err) => {
        if (err?.status === 404) {
          return of({
            status: 409,
            message: 'Endpoint /profiles/me indisponible sur ce backend',
            data: normalizeUserProfile(data)
          } as IResponseType<UserProfile>);
        }
        return throwError(() => err);
      })
    );
  }
}
