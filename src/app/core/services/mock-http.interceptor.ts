import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { MOCK_USERS, MOCK_EVENTS, MOCK_BILLETS, MOCK_PAIEMENTS, MOCK_DASHBOARD_STATS, MOCK_ONBOARDING_REQUESTS, MOCK_NOTIFICATIONS, MOCK_LOGIN_RESPONSE } from '../data/mock-data';

export class MockInterceptorConfig {
  static enabled = (() => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mock') === 'true') return true;

    // Check localStorage
    if (localStorage.getItem('mockEnabled') === 'true') return true;

    return false;
  })();

  static simulateDelay = 800; // ms
}

/**
 * Mock HTTP Interceptor
 * Intercepts HTTP requests and returns mock data when enabled
 */
export const mockHttpInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MockInterceptorConfig.enabled) {
    return next(req);
  }

  const url = req.url;
  const method = req.method;

  // Mock responses based on URL patterns
  if (method === 'GET') {
    // Dashboard stats
    if (url.includes('/admin/stats/dashboard')) {
      return of(new HttpResponse({
        status: 200,
        body: { status: 200, message: 'Dashboard stats retrieved', data: MOCK_DASHBOARD_STATS }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }

    // Users
    if (url.includes('/admin/users')) {
      const page = req.params.get('page') ? +req.params.get('page')! : 0;
      const size = req.params.get('size') ? +req.params.get('size')! : 10;
      const search = req.params.get('search') || '';
      const role = req.params.get('role') || '';

      let filteredUsers = MOCK_USERS;
      if (search) {
        filteredUsers = filteredUsers.filter(u =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (role) {
        filteredUsers = filteredUsers.filter(u =>
          u.roles.some(r => r.name.toLowerCase().includes(role.toLowerCase()))
        );
      }

      const start = page * size;
      const end = start + size;
      const paginatedUsers = filteredUsers.slice(start, end);

      return of(new HttpResponse({
        status: 200,
        body: {
          status: 200,
          message: 'Users retrieved',
          data: {
            content: paginatedUsers,
            totalElements: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / size),
            size,
            number: page,
            first: page === 0,
            last: end >= filteredUsers.length
          }
        }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }

    // Events
    if (url.includes('/admin/events')) {
      const page = req.params.get('page') ? +req.params.get('page')! : 0;
      const size = req.params.get('size') ? +req.params.get('size')! : 10;
      const statut = req.params.get('statut') || '';

      let filteredEvents = MOCK_EVENTS;
      if (statut) {
        filteredEvents = filteredEvents.filter(e => e.statut === statut);
      }

      const start = page * size;
      const end = start + size;
      const paginatedEvents = filteredEvents.slice(start, end);

      return of(new HttpResponse({
        status: 200,
        body: {
          status: 200,
          message: 'Events retrieved',
          data: {
            content: paginatedEvents,
            totalElements: filteredEvents.length,
            totalPages: Math.ceil(filteredEvents.length / size),
            size,
            number: page,
            first: page === 0,
            last: end >= filteredEvents.length
          }
        }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }

    // Billing/Tickets
    if (url.includes('/admin/billing/tickets')) {
      return of(new HttpResponse({
        status: 200,
        body: {
          status: 200,
          message: 'Tickets retrieved',
          data: {
            content: MOCK_BILLETS,
            totalElements: MOCK_BILLETS.length,
            totalPages: 1,
            size: MOCK_BILLETS.length,
            number: 0,
            first: true,
            last: true
          }
        }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }

    // Payments
    if (url.includes('/admin/payments')) {
      return of(new HttpResponse({
        status: 200,
        body: {
          status: 200,
          message: 'Payments retrieved',
          data: {
            content: MOCK_PAIEMENTS,
            totalElements: MOCK_PAIEMENTS.length,
            totalPages: 1,
            size: MOCK_PAIEMENTS.length,
            number: 0,
            first: true,
            last: true
          }
        }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }

    // Onboarding requests
    if (url.includes('/admin/onboarding')) {
      return of(new HttpResponse({
        status: 200,
        body: {
          status: 200,
          message: 'Onboarding requests retrieved',
          data: MOCK_ONBOARDING_REQUESTS
        }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }

    // Notifications
    if (url.includes('/admin/notifications')) {
      return of(new HttpResponse({
        status: 200,
        body: {
          status: 200,
          message: 'Notifications retrieved',
          data: MOCK_NOTIFICATIONS
        }
      })).pipe(delay(MockInterceptorConfig.simulateDelay));
    }
  }

  // Login
  if (method === 'POST' && url.includes('/auth/login')) {
    return of(new HttpResponse({
      status: 200,
      body: MOCK_LOGIN_RESPONSE
    })).pipe(delay(MockInterceptorConfig.simulateDelay));
  }

  // For unhandled requests, pass through
  return next(req);
};