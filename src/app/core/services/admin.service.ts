import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import ResponseType from '../models/api_resp.model';
import { DashboardStats, Evenement, Billet, Paiement, OnboardingRequest, FreemiumConfig, KikNotification } from '../models/kikevent.models';
import { User } from '../models/user/User.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  getDashboardStats(): Observable<ResponseType<DashboardStats>> {
    return this.http.get<ResponseType<DashboardStats>>(`${this.api}/admin/stats`);
  }
  getUsers(page = 0, size = 10, search = '', role = ''): Observable<ResponseType<any>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (search) { p = p.set('search', search); }
    if (role)   { p = p.set('role', role); }
    return this.http.get<ResponseType<any>>(`${this.api}/admin/users`, { params: p });
  }
  suspendUser(userId: number, motif: string): Observable<ResponseType<User>> {
    return this.http.patch<ResponseType<User>>(`${this.api}/admin/users/${userId}/suspend`, { motif });
  }
  activateUser(userId: number): Observable<ResponseType<User>> {
    return this.http.patch<ResponseType<User>>(`${this.api}/admin/users/${userId}/activate`, {});
  }
  resetUserPassword(userId: number): Observable<ResponseType<any>> {
    return this.http.post<ResponseType<any>>(`${this.api}/admin/users/${userId}/reset-password`, {});
  }
  assignRole(userId: number, role: string): Observable<ResponseType<User>> {
    return this.http.patch<ResponseType<User>>(`${this.api}/admin/users/${userId}/role`, { role });
  }
  getOnboardingRequests(statut = '', page = 0, size = 50): Observable<ResponseType<any>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (statut) { p = p.set('statut', statut); }
    return this.http.get<ResponseType<any>>(`${this.api}/admin/onboarding`, { params: p });
  }
  approveOnboarding(id: number): Observable<ResponseType<OnboardingRequest>> {
    return this.http.patch<ResponseType<OnboardingRequest>>(`${this.api}/admin/onboarding/${id}/approve`, {});
  }
  rejectOnboarding(id: number, motif: string): Observable<ResponseType<OnboardingRequest>> {
    return this.http.patch<ResponseType<OnboardingRequest>>(`${this.api}/admin/onboarding/${id}/reject`, { motif });
  }
  getEvents(statut = '', page = 0, size = 10, search = ''): Observable<ResponseType<any>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (statut) { p = p.set('statut', statut); }
    if (search) { p = p.set('search', search); }
    return this.http.get<ResponseType<any>>(`${this.api}/admin/events`, { params: p });
  }
  validateEvent(id: number): Observable<ResponseType<Evenement>> {
    return this.http.patch<ResponseType<Evenement>>(`${this.api}/admin/events/${id}/validate`, {});
  }
  refuseEvent(id: number, motif: string): Observable<ResponseType<Evenement>> {
    return this.http.patch<ResponseType<Evenement>>(`${this.api}/admin/events/${id}/refuse`, { motif });
  }
  getBillets(statut = '', page = 0, size = 10): Observable<ResponseType<any>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (statut) { p = p.set('statut', statut); }
    return this.http.get<ResponseType<any>>(`${this.api}/admin/billets`, { params: p });
  }
  refundBillet(id: number): Observable<ResponseType<Billet>> {
    return this.http.patch<ResponseType<Billet>>(`${this.api}/admin/billets/${id}/refund`, {});
  }
  getPayments(statut = '', page = 0, size = 10): Observable<ResponseType<any>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (statut) { p = p.set('statut', statut); }
    return this.http.get<ResponseType<any>>(`${this.api}/admin/payments`, { params: p });
  }
  generateFinancialReport(dateDebut: string, dateFin: string): Observable<Blob> {
    const p = new HttpParams().set('dateDebut', dateDebut).set('dateFin', dateFin);
    return this.http.get(`${this.api}/admin/reports/financial`, { params: p, responseType: 'blob' });
  }
  getNotifications(page = 0, size = 20): Observable<ResponseType<any>> {
    const p = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ResponseType<any>>(`${this.api}/admin/notifications`, { params: p });
  }
  sendNotification(payload: Partial<KikNotification>): Observable<ResponseType<KikNotification>> {
    return this.http.post<ResponseType<KikNotification>>(`${this.api}/admin/notifications`, payload);
  }
  getFreemiumConfig(): Observable<ResponseType<FreemiumConfig>> {
    return this.http.get<ResponseType<FreemiumConfig>>(`${this.api}/admin/freemium-config`);
  }
  updateFreemiumConfig(cfg: Partial<FreemiumConfig>): Observable<ResponseType<FreemiumConfig>> {
    return this.http.put<ResponseType<FreemiumConfig>>(`${this.api}/admin/freemium-config`, cfg);
  }
}
