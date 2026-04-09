import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import ResponseType, { ResponseType as IResponseType } from '../models/api_resp.model';
import { User } from '../models/user/User.model';
import {
  UpdateUserStatusRequest,
  ResetUserPasswordRequest,
  AssignRoleRequest,
  RemoveRoleRequest,
  OrganizerRequestDecisionRequest,
  PaginatedResponse
} from '../models/admin/admin-dto.model';
import { OrganizerRequest } from '../models/organizer/organizer.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  // ─────────────────────────────────────────────
  // USERS  →  /admin/users
  // ─────────────────────────────────────────────

  /** GET /admin/users - Récupère la liste paginée des utilisateurs */
  getUsers(
    page = 0,
    size = 10,
    search = '',
    role = ''
  ): Observable<IResponseType<PaginatedResponse<User>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) { params = params.set('search', search); }
    if (role)   { params = params.set('role', role); }
    return this.http.get<IResponseType<PaginatedResponse<User>>>(
      `${this.api}/admin/users`,
      { params }
    );
  }

  /** GET /admin/users/{id} - Récupère un utilisateur par ID */
  getUserById(id: number): Observable<IResponseType<User>> {
    return this.http.get<IResponseType<User>>(`${this.api}/admin/users/${id}`);
  }

  /**
   * PATCH /admin/users/{id}/status - Change le statut d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param status - 'ACTIVE' | 'SUSPENDED'
   */
  updateUserStatus(
    userId: number,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Observable<IResponseType<User>> {
    const body: UpdateUserStatusRequest = { status };
    return this.http.patch<IResponseType<User>>(
      `${this.api}/admin/users/${userId}/status`,
      body
    );
  }

  /**
   * PATCH /admin/users/{id}/password - Réinitialise le mot de passe d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param newPassword - Nouveaux mot de passe temporaire
   */
  resetUserPassword(
    userId: number,
    newPassword: string
  ): Observable<IResponseType<User>> {
    const body: ResetUserPasswordRequest = { newPassword };
    return this.http.patch<IResponseType<User>>(
      `${this.api}/admin/users/${userId}/password`,
      body
    );
  }

  // ─────────────────────────────────────────────
  // ROLES  →  /admin/users/{id}/roles
  // ─────────────────────────────────────────────

  /**
   * PATCH /admin/users/{id}/roles/assign - Assigne un rôle à un utilisateur
   * Les rôles sont additifs (multi-rôles)
   * @param userId - ID de l'utilisateur
   * @param roleName - Nom du rôle (ex: 'ORGANIZER', 'PARTICIPANT', 'CONTROLER', 'ADMIN')
   */
  assignRole(userId: number, roleName: string): Observable<IResponseType<User>> {
    const body: AssignRoleRequest = { roleName };
    return this.http.patch<IResponseType<User>>(
      `${this.api}/admin/users/${userId}/roles/assign`,
      body
    );
  }

  /**
   * PATCH /admin/users/{id}/roles/remove - Retire un rôle à un utilisateur
   * @param userId - ID de l'utilisateur
   * @param roleName - Nom du rôle à retirer
   */
  removeRole(userId: number, roleName: string): Observable<IResponseType<User>> {
    const body: RemoveRoleRequest = { roleName };
    return this.http.patch<IResponseType<User>>(
      `${this.api}/admin/users/${userId}/roles/remove`,
      body
    );
  }

  // ─────────────────────────────────────────────
  // ORGANIZER REQUESTS  →  /admin/organizer-requests
  // ─────────────────────────────────────────────

  /**
   * GET /admin/organizer-requests - Récupère la liste paginée des demandes organizer
   * @param page - Numéro de la page
   * @param size - Taille de la page
   * @param status - Filtrer par statut (PENDING, APPROVED, REJECTED)
   */
  getOrganizerRequests(
    page = 0,
    size = 50,
    status = ''
  ): Observable<IResponseType<PaginatedResponse<OrganizerRequest>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) { params = params.set('status', status); }
    return this.http.get<IResponseType<PaginatedResponse<OrganizerRequest>>>(
      `${this.api}/admin/organizer-requests`,
      { params }
    );
  }

  /**
   * GET /admin/organizer-requests/{userId} - Récupère la demande d'un utilisateur
   * @param userId - ID de l'utilisateur
   */
  getOrganizerRequestByUser(userId: number): Observable<IResponseType<OrganizerRequest>> {
    return this.http.get<IResponseType<OrganizerRequest>>(
      `${this.api}/admin/organizer-requests/${userId}`
    );
  }

  /**
   * PATCH /admin/organizer-requests/{userId}/decision - Valide ou rejette une demande organizer
   *
   * Comportement backend:
   * - Si approved = true:
   *   - document → APPROVED
   *   - organizer profile → isVerified = true
   *   - rôle ORGANIZER attribué
   * - Si approved = false:
   *   - document → REJECTED
   *   - raison de rejet sauvegardée
   *
   * @param userId - ID de l'utilisateur
   * @param approved - true pour approuver, false pour rejeter
   * @param rejectionReason - Raison du rejet (requis si approved = false)
   */
  decideOrganizerRequest(
    userId: number,
    approved: boolean,
    rejectionReason: string | null = null
  ): Observable<IResponseType<OrganizerRequest>> {
    const body: OrganizerRequestDecisionRequest = { approved, rejectionReason };
    return this.http.patch<IResponseType<OrganizerRequest>>(
      `${this.api}/admin/organizer-requests/${userId}/decision`,
      body
    );
  }

  // ─────────────────────────────────────────────
  // BILLING  →  /admin/billing
  // ─────────────────────────────────────────────

  /** GET /admin/billing/tickets */
  getBillets(statut = ''): Observable<IResponseType<any>> {
    let params = new HttpParams();
    if (statut) { params = params.set('statut', statut); }
    return this.http.get<IResponseType<any>>(`${this.api}/admin/billing/tickets`, { params });
  }

  /** PATCH /admin/billing/tickets/{id}/refund */
  refundBillet(billetId: number): Observable<IResponseType<any>> {
    return this.http.patch<IResponseType<any>>(
      `${this.api}/admin/billing/tickets/${billetId}/refund`,
      {}
    );
  }

  // ─────────────────────────────────────────────
  // DASHBOARD  →  /admin/stats
  // ─────────────────────────────────────────────

  /** GET /admin/stats/dashboard */
  getDashboardStats(): Observable<IResponseType<any>> {
    return this.http.get<IResponseType<any>>(`${this.api}/admin/stats/dashboard`);
  }

  // ─────────────────────────────────────────────
  // EVENTS  →  /admin/events
  // ─────────────────────────────────────────────

  /** GET /admin/events */
  getEvents(statut = '', page = 0, size = 10, search = ''): Observable<IResponseType<any>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) { params = params.set('statut', statut); }
    if (search) { params = params.set('search', search); }
    return this.http.get<IResponseType<any>>(`${this.api}/admin/events`, { params });
  }

  /** PATCH /admin/events/{id}/validate */
  validateEvent(eventId: number): Observable<IResponseType<any>> {
    return this.http.patch<IResponseType<any>>(
      `${this.api}/admin/events/${eventId}/validate`,
      {}
    );
  }

  /** PATCH /admin/events/{id}/refuse */
  refuseEvent(eventId: number, motif: string): Observable<IResponseType<any>> {
    return this.http.patch<IResponseType<any>>(
      `${this.api}/admin/events/${eventId}/refuse`,
      { motif }
    );
  }

  // ─────────────────────────────────────────────
  // FREEMIUM  →  /admin/freemium
  // ─────────────────────────────────────────────

  /** GET /admin/freemium/config */
  getFreemiumConfig(): Observable<IResponseType<any>> {
    return this.http.get<IResponseType<any>>(`${this.api}/admin/freemium/config`);
  }

  /** PATCH /admin/freemium/config */
  updateFreemiumConfig(config: any): Observable<IResponseType<any>> {
    return this.http.patch<IResponseType<any>>(
      `${this.api}/admin/freemium/config`,
      config
    );
  }

  // ─────────────────────────────────────────────
  // NOTIFICATIONS  →  /admin/notifications
  // ─────────────────────────────────────────────

  /** GET /admin/notifications */
  getNotifications(): Observable<IResponseType<any>> {
    return this.http.get<IResponseType<any>>(`${this.api}/admin/notifications`);
  }

  /** POST /admin/notifications/send */
  sendNotification(payload: any): Observable<IResponseType<any>> {
    return this.http.post<IResponseType<any>>(
      `${this.api}/admin/notifications/send`,
      payload
    );
  }

  // ─────────────────────────────────────────────
  // PAYMENTS  →  /admin/payments
  // ─────────────────────────────────────────────

  /** GET /admin/payments */
  getPayments(statut = ''): Observable<IResponseType<any>> {
    let params = new HttpParams();
    if (statut) { params = params.set('statut', statut); }
    return this.http.get<IResponseType<any>>(`${this.api}/admin/payments`, { params });
  }

  /** GET /admin/payments/report - Génère un rapport financier PDF */
  generateFinancialReport(dateDebut: string, dateFin: string): Observable<Blob> {
    let params = new HttpParams().set('dateDebut', dateDebut).set('dateFin', dateFin);
    return this.http.get(`${this.api}/admin/payments/report`, {
      params,
      responseType: 'blob'
    });
  }
}
