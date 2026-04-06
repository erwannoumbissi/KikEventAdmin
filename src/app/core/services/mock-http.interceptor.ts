/**
 * Mock HTTP Interceptor for Development
 * 
 * This interceptor intercepts HTTP requests and returns mock data
 * instead of making actual API calls. It simulates realistic API responses
 * with proper delays to mimic network latency.
 * 
 * Usage:
 * - Set MockInterceptor.enabled = true in environment.development.ts
 * - Or pass ?mock=true as a query parameter in the URL
 */

import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import {
  MOCK_DATA,
  MOCK_LOGIN_RESPONSE,
  MOCK_CURRENT_USER,
  MOCK_USERS,
  MOCK_EVENTS,
  MOCK_BILLETS,
  MOCK_PAIEMENTS,
  MOCK_ONBOARDING_REQUESTS,
  MOCK_FREEMIUM_CONFIG,
  MOCK_DASHBOARD_STATS,
  MOCK_NOTIFICATIONS
} from '../data/mock-data';

// Configuration
export class MockInterceptorConfig {
  static enabled = true; // Always enabled for development
  static simulateDelay = 800; // Simulate network delay in ms
  static simulateErrors = false; // Set to true to simulate random errors
}

// Helper to simulate paginated response
function getPaginatedResponse<T>(
  items: T[],
  page: number,
  size: number
): { content: T[]; totalElements: number; totalPages: number; currentPage: number } {
  const start = page * size;
  const end = start + size;
  const content = items.slice(start, end);
  const totalPages = Math.ceil(items.length / size);

  return {
    content,
    totalElements: items.length,
    totalPages,
    currentPage: page
  };
}

// Helper to wrap response in standard format
function wrapResponse<T>(data: T, code = 200, message = 'Success') {
  return {
    code,
    message,
    data
  };
}

export const mockHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next
) => {
  // Mock interceptor is always enabled for development
  console.log(`[MOCK API] ${req.method} ${req.url}`);

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================
  if (req.url.includes('/auth/login') && req.method === 'POST') {
    return of(
      new HttpResponse({
        status: 200,
        body: MOCK_LOGIN_RESPONSE
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/my-permissions-roles') && req.method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(MOCK_CURRENT_USER)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  // ============================================================================
  // ADMIN USERS ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/users') && req.method === 'GET' && !req.url.includes('/admin/users/')) {
    const params = req.params;
    const page = parseInt(params.get('page') || '0', 10);
    const size = parseInt(params.get('size') || '10', 10);
    const search = params.get('search') || '';

    let filtered = MOCK_USERS;
    if (search) {
      filtered = filtered.filter(
        u => u.username.toLowerCase().includes(search.toLowerCase()) ||
             u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const paginated = getPaginatedResponse(filtered, page, size);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(paginated)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/users/') && req.url.includes('/suspend') && req.method === 'PATCH') {
    const userId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.enabled = false;
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(user)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  if (req.url.includes('/admin/users/') && req.url.includes('/activate') && req.method === 'PATCH') {
    const userId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.enabled = true;
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(user)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  if (req.url.includes('/admin/users/') && req.url.includes('/reset-password') && req.method === 'POST') {
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse({ success: true, message: 'Password reset email sent' })
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/users/') && req.url.includes('/role') && req.method === 'PATCH') {
    const userId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user && (req.body as any)?.role) {
      user.roles = [{ id: 2, name: (req.body as any).role }];
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(user)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  // ============================================================================
  // DASHBOARD ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/stats') && req.method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(MOCK_DASHBOARD_STATS)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  // ============================================================================
  // EVENTS ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/events') && req.method === 'GET' && !req.url.includes('/admin/events/')) {
    const params = req.params;
    const page = parseInt(params.get('page') || '0', 10);
    const size = parseInt(params.get('size') || '10', 10);
    const statut = params.get('statut') || '';
    const search = params.get('search') || '';

    let filtered = MOCK_EVENTS;
    if (statut) {
      filtered = filtered.filter(e => e.statut === statut);
    }
    if (search) {
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(search.toLowerCase()) ||
        e.organisateurNom.toLowerCase().includes(search.toLowerCase())
      );
    }

    const paginated = getPaginatedResponse(filtered, page, size);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(paginated)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/events/') && req.url.includes('/validate') && req.method === 'PATCH') {
    const eventId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (event) {
      event.statut = 'VALIDATED';
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(event)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  if (req.url.includes('/admin/events/') && req.url.includes('/refuse') && req.method === 'PATCH') {
    const eventId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (event) {
      event.statut = 'REFUSED';
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(event)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  // ============================================================================
  // TICKETS ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/billets') && req.method === 'GET' && !req.url.includes('/admin/billets/')) {
    const params = req.params;
    const page = parseInt(params.get('page') || '0', 10);
    const size = parseInt(params.get('size') || '10', 10);
    const statut = params.get('statut') || '';

    let filtered = MOCK_BILLETS;
    if (statut) {
      filtered = filtered.filter(b => b.statut === statut);
    }

    const paginated = getPaginatedResponse(filtered, page, size);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(paginated)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/billets/') && req.url.includes('/refund') && req.method === 'PATCH') {
    const billetId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const billet = MOCK_BILLETS.find(b => b.id === billetId);
    if (billet) {
      billet.statut = 'REMBOURSE';
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(billet)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  // ============================================================================
  // PAYMENTS ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/payments') && req.method === 'GET') {
    const params = req.params;
    const page = parseInt(params.get('page') || '0', 10);
    const size = parseInt(params.get('size') || '10', 10);
    const statut = params.get('statut') || '';

    let filtered = MOCK_PAIEMENTS;
    if (statut) {
      filtered = filtered.filter(p => p.statut === statut);
    }

    const paginated = getPaginatedResponse(filtered, page, size);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(paginated)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  // ============================================================================
  // ONBOARDING ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/onboarding') && req.method === 'GET' && !req.url.includes('/admin/onboarding/')) {
    const params = req.params;
    const page = parseInt(params.get('page') || '0', 10);
    const size = parseInt(params.get('size') || '50', 10);
    const statut = params.get('statut') || '';

    let filtered = MOCK_ONBOARDING_REQUESTS;
    if (statut) {
      filtered = filtered.filter(o => o.statut === statut);
    }

    const paginated = getPaginatedResponse(filtered, page, size);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(paginated)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/onboarding/') && req.url.includes('/approve') && req.method === 'PATCH') {
    const obId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const ob = MOCK_ONBOARDING_REQUESTS.find(o => o.id === obId);
    if (ob) {
      ob.statut = 'APPROVED';
      ob.updatedAt = new Date().toISOString();
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(ob)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  if (req.url.includes('/admin/onboarding/') && req.url.includes('/reject') && req.method === 'PATCH') {
    const obId = parseInt(req.url.split('/')[req.url.split('/').length - 2], 10);
    const ob = MOCK_ONBOARDING_REQUESTS.find(o => o.id === obId);
    if (ob) {
      ob.statut = 'REJECTED';
      ob.motifRejet = (req.body as any)?.motif || 'Rejeté';
      ob.updatedAt = new Date().toISOString();
      return of(
        new HttpResponse({
          status: 200,
          body: wrapResponse(ob)
        })
      ).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  // ============================================================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/notifications') && req.method === 'GET') {
    const params = req.params;
    const page = parseInt(params.get('page') || '0', 10);
    const size = parseInt(params.get('size') || '20', 10);

    const paginated = getPaginatedResponse(MOCK_NOTIFICATIONS, page, size);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(paginated)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/notifications') && req.method === 'POST') {
    const notification = {
      ...(req.body as any),
      id: MOCK_NOTIFICATIONS.length + 1,
      createdAt: new Date().toISOString()
    };
    return of(
      new HttpResponse({
        status: 201,
        body: wrapResponse(notification, 201, 'Notification created')
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  // ============================================================================
  // REPORTS ENDPOINTS
  // ============================================================================
  if (req.url.includes('/admin/reports/financial')) {
    // Simulate PDF generation as blob response
    const pdfContent = 'Mock PDF Financial Report - Binary Content Here';
    return of(
      new HttpResponse({
        status: 200,
        body: new Blob([pdfContent], { type: 'application/pdf' })
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay)) as any;
  }


  // ============================================================================
  // FREEMIUM CONFIG ENDPOINTS (FIX #4 : handlers manquants)
  // ============================================================================
  if (req.url.includes('/admin/freemium-config') && req.method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(MOCK_FREEMIUM_CONFIG)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  if (req.url.includes('/admin/freemium-config') && req.method === 'PUT') {
    const updated = { ...MOCK_FREEMIUM_CONFIG, ...(req.body as any), updatedAt: new Date().toISOString() };
    Object.assign(MOCK_FREEMIUM_CONFIG, updated);
    return of(
      new HttpResponse({
        status: 200,
        body: wrapResponse(MOCK_FREEMIUM_CONFIG)
      })
    ).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  // ============================================================================
  // NOT FOUND - Pass through for unmocked endpoints
  // ============================================================================
  console.warn(`[MOCK API] No mock handler for: ${req.method} ${req.url}`);
  return next(req);
};
