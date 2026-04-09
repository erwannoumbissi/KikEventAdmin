import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { appInterceptor } from './core/services/app.interceptor';

// mockHttpInterceptor retiré — le projet utilise maintenant le vrai backend.
// Pour réactiver le mode mock (développement sans backend), ajouter :
//   import { mockHttpInterceptor } from './core/services/mock-http.interceptor';
// puis l'ajouter dans withInterceptors([appInterceptor, mockHttpInterceptor]).

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([appInterceptor])),
  ]
};
