import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { LoaderService } from '../../shared/components/loader/service/loader.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { UserHelper } from '../../shared/helpers/user';
import { LocalStorage } from '../../shared/helpers/localStorage';
import { TOKEN_KEY } from './auth.service';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'danger';

/**
 * Intercepteur global pour les requêtes HTTP
 * - Ajoute le token JWT au header Authorization
 * - Gère le chargement global (Loader)
 * - Gère les erreurs HTTP (401, 403, 404, 422, 500, etc.)
 */
export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  loaderService.show();

  // ─────────────────────────────────────────────
  // 1. Ajout du Token JWT si connecté
  // ─────────────────────────────────────────────
  let authReq = req;
  if (UserHelper.isConnect()) {
    const token = LocalStorage.getItem(TOKEN_KEY);
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        // Log optionnel du message backend
        // console.log('API Response:', event.body?.message);
      }
    }),
    finalize(() => {
      loaderService.hide();
    }),
    catchError((error: HttpErrorResponse) => {
      return handleHttpError(error, toastService, router);
    })
  );
};

/**
 * Gestion centralisée des erreurs HTTP
 * Conforme aux codes HTTP retournés par le backend
 */
function handleHttpError(
  error: HttpErrorResponse,
  toastService: ToastService,
  router: Router
): Observable<never> {
  let type: ToastType = 'error';
  const timeout = 5000;

  let message = error.error?.message || 'Une erreur est survenue';

  // ─────────────────────────────────────────────
  // Distinction des types d'erreur
  // ─────────────────────────────────────────────
  if (error.error instanceof ErrorEvent) {
    // Erreur réseau côté client
    message = 'Erreur réseau - Vérifiez votre connexion';
  } else {
    const reqUrl = error.url ?? '';
    const isExpectedProfile404 =
      error.status === 404 &&
      (reqUrl.includes('/api/v1/profiles/me') || reqUrl.includes('/api/v1/admin/profiles/'));
    if (isExpectedProfile404) {
      return throwError(() => error);
    }

    // Erreur serveur (HTTP status)
    switch (error.status) {
      case 0:
        message = 'Serveur injoignable (vérifiez CORS ou que le backend soit démarré)';
        break;

      case 400:
        type = 'warning';
        message = error.error?.message || 'Requête invalide';
        break;

      case 401:
        message = error.error?.message || 'Session expirée - Reconnexion requise';
        // Redirige vers login car le token est invalide/expiré
        UserHelper.logoutUser();
        router.navigate(['/login']);
        break;

      case 403:
        message = "Vous n'avez pas les droits nécessaires pour accéder à cette ressource";
        router.navigate(['/']);
        break;

      case 404:
        type = 'info';
        message = error.error?.message || 'Ressource introuvable';
        break;

      case 409:
        type = 'warning';
        message = error.error?.message || 'Conflit avec la ressource';
        break;

      case 422:
        type = 'warning';
        message = error.error?.message || 'Validation des données échouée';
        // Note: Si erreurs détaillées disponibles, passer à error.error.data
        break;

      case 500:
        type = 'danger';
        message = 'Erreur serveur interne (500)';
        break;

      case 503:
        message = 'Service temporairement indisponible (503)';
        break;

      default:
        message = `Erreur ${error.status}: ${message}`;
    }
  }

  toastService.show(type, message, timeout);
  return throwError(() => error);
}

