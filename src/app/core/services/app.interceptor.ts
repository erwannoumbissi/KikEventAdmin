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

export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  const toastService  = inject(ToastService);
  const router        = inject(Router);

  loaderService.show();

  // FIX #2 : lecture du token avec la clé unifiée TOKEN_KEY
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
        // Optionnel : log event.body.message ici
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

function handleHttpError(
  error: HttpErrorResponse,
  toastService: ToastService,
  router: Router
): Observable<never> {
  let type: ToastType = 'error';
  const timeout = 5000;

  let message = error.error?.message || 'Une erreur est survenue';

  if (error.error instanceof ErrorEvent) {
    message = 'Erreur réseau - Vérifiez votre connexion';
  } else {
    switch (error.status) {
      case 0:   message = 'Serveur injoignable (CORS ou Down)'; break;
      case 400: type = 'warning'; break;
      case 401:
        message = error.error?.message || 'Session expirée - Reconnexion requise';
        router.navigate(['/login']);
        break;
      case 403:
        message = "Vous n'avez pas les droits nécessaires";
        router.navigate(['/']);
        break;
      case 404: type = 'info'; message = error.error?.message || 'Ressource introuvable'; break;
      case 409: type = 'warning'; break;
      case 422: type = 'warning'; break;
      case 500: type = 'danger'; message = 'Erreur serveur interne (500)'; break;
      case 503: message = 'Service temporairement indisponible'; break;
    }
  }

  toastService.show(type, message, timeout);
  return throwError(() => error);
}
