import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResponseType } from '../models/api_resp.model';
import { User, UserProfile, UpdateProfileRequest } from '../models/user/User.model';
import {
  UpdateUserStatusRequest,
  ResetUserPasswordRequest,
  AssignRoleRequest,
  RemoveRoleRequest,
  OrganizerRequestDecisionRequest,
  PagedResponse
} from '../models/admin/admin-dto.model';
import { OrganizerRequest } from '../models/organizer/organizer.model';
import {
  normalizeBaseResponse,
  normalizeOrganizerRequest,
  normalizePagedOrArray,
  normalizeUser,
  normalizeUserProfile
} from '../adapters/api-normalizers';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  // ══════════════════════════════════════════════════════════════════
  // USERS  —  /admin/users
  // ══════════════════════════════════════════════════════════════════

  /** GET /admin/users — liste paginée */
  getUsers(): Observable<ResponseType<PagedResponse<User> | User[]>> {
    return this.http.get<ResponseType<PagedResponse<User> | User[]>>(
      `${this.api}/admin/users`
    ).pipe(
      map(res => normalizeBaseResponse(res, data => normalizePagedOrArray(data, normalizeUser)))
    );
  }

  /** GET /admin/users/{id} */
  getUserById(id: number): Observable<ResponseType<User>> {
    return this.http.get<ResponseType<User>>(`${this.api}/admin/users/${id}`).pipe(
      map(res => normalizeBaseResponse(res, normalizeUser))
    );
  }

  /**
   * PATCH /admin/users/{id}/status
   * Swagger: AdminUpdateUserStatusRequest → { enabled: boolean }
   */
  updateUserStatus(userId: number, enabled: boolean): Observable<ResponseType<User>> {
    const body: UpdateUserStatusRequest = { enabled };
    return this.http.patch<ResponseType<User>>(
      `${this.api}/admin/users/${userId}/status`, body
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUser))
    );
  }

  /**
   * PATCH /admin/users/{id}/password
   * Swagger: AdminResetPasswordRequestT → { newPassword: string (min 8) }
   */
  resetUserPassword(userId: number, newPassword: string): Observable<ResponseType<User>> {
    const body: ResetUserPasswordRequest = { newPassword };
    return this.http.patch<ResponseType<User>>(
      `${this.api}/admin/users/${userId}/password`, body
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUser))
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ROLES  —  /admin/users/{id}/roles
  // ══════════════════════════════════════════════════════════════════

  /**
   * PATCH /admin/users/{id}/roles/assign
   * Swagger: AdminRoleRequest → { roleName: string }
   */
  assignRole(userId: number, roleName: string): Observable<ResponseType<User>> {
    const body: AssignRoleRequest = { roleName };
    return this.http.patch<ResponseType<User>>(
      `${this.api}/admin/users/${userId}/roles/assign`, body
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUser))
    );
  }

  /**
   * PATCH /admin/users/{id}/roles/remove
   * Swagger: AdminRoleRequest → { roleName: string }
   */
  removeRole(userId: number, roleName: string): Observable<ResponseType<User>> {
    const body: RemoveRoleRequest = { roleName };
    return this.http.patch<ResponseType<User>>(
      `${this.api}/admin/users/${userId}/roles/remove`, body
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUser))
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ORGANIZER REQUESTS  —  /admin/organizer-requests
  // ══════════════════════════════════════════════════════════════════

  /** GET /admin/organizer-requests */
  getOrganizerRequests(): Observable<ResponseType<PagedResponse<OrganizerRequest> | OrganizerRequest[]>> {
    return this.http.get<ResponseType<PagedResponse<OrganizerRequest> | OrganizerRequest[]>>(
      `${this.api}/admin/organizer-requests`
    ).pipe(
      map(res => normalizeBaseResponse(res, data => normalizePagedOrArray(data, normalizeOrganizerRequest)))
    );
  }

  /** GET /admin/organizer-requests/{userId} */
  getOrganizerRequestByUser(userId: number): Observable<ResponseType<OrganizerRequest>> {
    return this.http.get<ResponseType<OrganizerRequest>>(
      `${this.api}/admin/organizer-requests/${userId}`
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeOrganizerRequest))
    );
  }

  /**
   * PATCH /admin/organizer-requests/{userId}/decision
   * Swagger: DemandeDécisionDeAdminOrganisateur → { approved, rejectionReason }
   */
  decideOrganizerRequest(
    userId: number,
    approved: boolean,
    rejectionReason: string | null = null
  ): Observable<ResponseType<OrganizerRequest>> {
    const body: OrganizerRequestDecisionRequest = { approved, rejectionReason };
    return this.http.patch<ResponseType<OrganizerRequest>>(
      `${this.api}/admin/organizer-requests/${userId}/decision`, body
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeOrganizerRequest))
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PROFILES  —  /admin/profiles
  // ══════════════════════════════════════════════════════════════════

  /** GET /admin/profiles — liste tous les profils utilisateur */
  getProfiles(): Observable<ResponseType<PagedResponse<UserProfile> | UserProfile[]>> {
    return this.http.get<ResponseType<PagedResponse<UserProfile> | UserProfile[]>>(
      `${this.api}/admin/profiles`
    ).pipe(
      map(res => normalizeBaseResponse(res, data => normalizePagedOrArray(data, normalizeUserProfile)))
    );
  }

  /** GET /admin/profiles/{id} */
  getProfileById(id: number): Observable<ResponseType<UserProfile>> {
    return this.http.get<ResponseType<UserProfile>>(`${this.api}/admin/profiles/${id}`).pipe(
      map(res => normalizeBaseResponse(res, normalizeUserProfile))
    );
  }

  /**
   * PUT /admin/profiles/{id}
   * Swagger: RequestProfilUtilisateur → { firstName, lastName, avatarUrl, bio }
   */
  updateProfile(id: number, data: UpdateProfileRequest): Observable<ResponseType<UserProfile>> {
    return this.http.put<ResponseType<UserProfile>>(
      `${this.api}/admin/profiles/${id}`, data
    ).pipe(
      map(res => normalizeBaseResponse(res, normalizeUserProfile))
    );
  }

  /** DELETE /admin/profiles/{id} */
  deleteProfile(id: number): Observable<ResponseType<void>> {
    return this.http.delete<ResponseType<void>>(`${this.api}/admin/profiles/${id}`).pipe(
      map(res => normalizeBaseResponse<void>(res, () => undefined))
    );
  }
}
