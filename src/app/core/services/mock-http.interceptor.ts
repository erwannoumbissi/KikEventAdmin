import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, delay, catchError } from 'rxjs';
import {
  MOCK_USERS, MOCK_EVENTS, MOCK_BILLETS, MOCK_PAIEMENTS,
  MOCK_DASHBOARD_STATS, MOCK_ONBOARDING_REQUESTS, MOCK_NOTIFICATIONS,
  MOCK_LOGIN_RESPONSE, MOCK_FREEMIUM_CONFIG
} from '../data/mock-data';

export class MockInterceptorConfig {
  /** Mode mock forcé (via ?mock=true ou localStorage) */
  static get forcedEnabled(): boolean {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mock') === 'true') return true;
      if (localStorage.getItem('mockEnabled') === 'true') return true;
    } catch { /* SSR guard */ }
    return false;
  }
  static simulateDelay = 400;
}

/** Construit une réponse mock standard conforme au BaseResponse du backend */
function mockResp(data: any, message = 'OK (mock)'): HttpResponse<any> {
  return new HttpResponse({ status: 200, body: { status: 200, message, data } });
}

/** Résout la réponse mock pour une requête donnée. Retourne null si non géré. */
function resolveMock(req: HttpRequest<any>): HttpResponse<any> | null {
  const url  = req.url;
  const meth = req.method;

  if (meth === 'POST' && url.includes('/auth/login')) {
    return new HttpResponse({ status: 200, body: MOCK_LOGIN_RESPONSE });
  }

  if (meth === 'GET') {
    if (url.includes('/admin/stats/dashboard')) {
      return mockResp(MOCK_DASHBOARD_STATS, 'Dashboard stats (mock)');
    }
    if (url.includes('/admin/users') && !url.match(/\/admin\/users\/\d+/)) {
      const page   = +(req.params.get('page') ?? 0);
      const size   = +(req.params.get('size') ?? 10);
      const search = (req.params.get('search') ?? '').toLowerCase();
      const role   = (req.params.get('role')   ?? '').toLowerCase();
      let list = [...MOCK_USERS];
      if (search) list = list.filter(u =>
        u.email.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search)
      );
      if (role) list = list.filter(u =>
        u.roles.some((r: any) => (r?.name ?? r).toLowerCase().includes(role))
      );
      const start = page * size;
      return mockResp({
        content: list.slice(start, start + size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        size, number: page, first: page === 0, last: start + size >= list.length
      }, 'Users (mock)');
    }
    if (url.match(/\/admin\/users\/\d+$/)) {
      const id   = +url.split('/').pop()!;
      const user = MOCK_USERS.find(u => u.id === id) ?? MOCK_USERS[0];
      return mockResp(user, 'User (mock)');
    }
    if (url.includes('/admin/events') && !url.match(/\/admin\/events\/\d+/)) {
      const page   = +(req.params.get('page')  ?? 0);
      const size   = +(req.params.get('size')  ?? 10);
      const statut = req.params.get('statut')  ?? '';
      const search = (req.params.get('search') ?? '').toLowerCase();
      let list = [...MOCK_EVENTS];
      if (statut) list = list.filter(e => e.statut === statut);
      if (search) list = list.filter(e => e.titre.toLowerCase().includes(search));
      const start = page * size;
      return mockResp({
        content: list.slice(start, start + size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        size, number: page, first: page === 0, last: start + size >= list.length
      }, 'Events (mock)');
    }
    if (url.includes('/admin/organizer-requests') && !url.match(/\/admin\/organizer-requests\/\d+/)) {
      const page   = +(req.params.get('page')  ?? 0);
      const size   = +(req.params.get('size')  ?? 50);
      const status = req.params.get('status')  ?? '';
      let list = [...MOCK_ONBOARDING_REQUESTS];
      if (status) list = list.filter((r: any) => r.statut === status);
      const start = page * size;
      return mockResp({
        content: list.slice(start, start + size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        size, number: page, first: page === 0, last: start + size >= list.length
      }, 'Organizer requests (mock)');
    }
    if (url.includes('/admin/billing/tickets')) {
      return mockResp({
        content: MOCK_BILLETS, totalElements: MOCK_BILLETS.length,
        totalPages: 1, size: MOCK_BILLETS.length, number: 0, first: true, last: true
      }, 'Billets (mock)');
    }
    if (url.includes('/admin/payments/report')) {
      return null; // Blob → laisse passer
    }
    if (url.includes('/admin/payments')) {
      const statut = req.params.get('statut') ?? '';
      let list = [...MOCK_PAIEMENTS];
      if (statut) list = list.filter((p: any) => p.statut === statut);
      return mockResp({
        content: list, totalElements: list.length,
        totalPages: 1, size: list.length, number: 0, first: true, last: true
      }, 'Payments (mock)');
    }
    if (url.includes('/admin/freemium/config')) {
      return mockResp(MOCK_FREEMIUM_CONFIG, 'Freemium config (mock)');
    }
    if (url.includes('/admin/notifications')) {
      return mockResp(MOCK_NOTIFICATIONS, 'Notifications (mock)');
    }
    if (url.endsWith('/me')) {
      return mockResp(MOCK_USERS[0], 'Me (mock)');
    }
  }

  if (['PATCH', 'POST'].includes(meth)) {
    if (url.includes('/admin/freemium/config')) {
      return mockResp(
        { ...MOCK_FREEMIUM_CONFIG, ...(req.body ?? {}), updatedAt: new Date().toISOString() },
        'Config mise à jour (mock)'
      );
    }
    if (url.match(/\/admin\/users\/\d+\/(status|password|roles\/assign|roles\/remove)/)) {
      const parts = url.split('/');
      const id    = +parts[parts.indexOf('users') + 1];
      const user  = MOCK_USERS.find(u => u.id === id) ?? MOCK_USERS[0];
      return mockResp(user, 'User mis à jour (mock)');
    }
    if (url.match(/\/admin\/organizer-requests\/\d+\/decision/)) {
      return mockResp(MOCK_ONBOARDING_REQUESTS[0], 'Décision enregistrée (mock)');
    }
    if (url.match(/\/admin\/events\/\d+\/(validate|refuse)/)) {
      return mockResp(MOCK_EVENTS[0], 'Événement mis à jour (mock)');
    }
    if (url.includes('/admin/notifications/send')) {
      return mockResp({ sent: true }, 'Notification envoyée (mock)');
    }
  }

  return null;
}

/**
 * Mock HTTP Interceptor — deux modes :
 *
 * 1. Forcé (?mock=true ou localStorage.setItem('mockEnabled','true'))
 *    → répond à TOUT sans appel réseau réel.
 *
 * 2. Auto-fallback (défaut)
 *    → laisse passer la requête ; si le backend répond 500
 *      (endpoint non encore implémenté), substitue silencieusement
 *      la réponse mock et supprime le toast d'erreur.
 */
export const mockHttpInterceptor: HttpInterceptorFn = (req, next) => {
  // ── Mode forcé ─────────────────────────────────────────────────────────────
  if (MockInterceptorConfig.forcedEnabled) {
    const mock = resolveMock(req);
    if (mock) {
      return of(mock).pipe(delay(MockInterceptorConfig.simulateDelay)) as Observable<any>;
    }
  }

  // ── Mode auto-fallback ─────────────────────────────────────────────────────
  return (next(req) as Observable<any>).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 500) {
        const mock = resolveMock(req);
        if (mock) {
          console.warn(`[MockFallback] 500 sur ${req.url} → données mock servies`);
          return of(mock).pipe(delay(100));
        }
      }
      throw err;
    })
  );
};
