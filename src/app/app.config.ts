import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { appInterceptor } from './core/services/app.interceptor';
import { mockHttpInterceptor } from './core/services/mock-http.interceptor';

// Intercepteur pour ajouter le token JWT et gérer les erreurs.
// mockHttpInterceptor activé en second — prend le relais si le backend renvoie 500
// (endpoints non encore implémentés : /admin/events, /admin/payments, /admin/freemium/config,
//  /admin/notifications, /admin/stats/dashboard, /admin/billing/tickets).
// Pour forcer le mock en développement : ajouter ?mock=true dans l'URL
// ou exécuter localStorage.setItem('mockEnabled','true') dans la console.

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withViewTransitions() retiré — provoquait InvalidStateError lors des navigations
    // avec chargement lazy + erreurs HTTP simultanées (View Transition API instable ici)
    provideRouter(routes),
    provideHttpClient(withInterceptors([appInterceptor, mockHttpInterceptor])),
  ]
};
