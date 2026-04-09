/**
 * Mock HTTP Interceptor — DÉSACTIVÉ (mode production)
 *
 * Ce fichier est conservé à titre de référence pour les développeurs qui
 * souhaitent travailler sans backend. Pour le réactiver :
 *   1. Importer mockHttpInterceptor dans app.config.ts
 *   2. L'ajouter dans withInterceptors([appInterceptor, mockHttpInterceptor])
 *   3. Passer MockInterceptorConfig.enabled = true ci-dessous
 *
 * En production, ce fichier n'est pas importé — il n'a aucun effet.
 */

import { HttpInterceptorFn } from '@angular/common/http';

export class MockInterceptorConfig {
  static enabled = false; // Désactivé — utilise le vrai backend
}

/** Interceptor passthrough — ne fait rien, laisse passer vers le vrai backend */
export const mockHttpInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
