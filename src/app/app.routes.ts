import { Routes } from '@angular/router';
import { IsAuthenticateGuard } from './shared/guards/isAuth.guard';
import { IsGuestGuard } from './shared/guards/isGuest.guard';
import { RoleGuard } from './shared/guards/Role.guard';

/**
 * Routes KikEvent Admin
 *
 * Protection :
 *   - /login         → IsGuestGuard (redirige vers /dashboard si déjà connecté)
 *   - toutes les vues admin → IsAuthenticateGuard (token + user) + RoleGuard (ADMIN)
 *   - /unauthorized  → accessible sans rôle (juste connecté)
 */
export const routes: Routes = [
  // ── Page publique ──────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./views/auth/login/login').then(m => m.LoginComponent),
    canActivate: [IsGuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./views/auth/register/register').then(m => m.RegisterComponent),
    canActivate: [IsGuestGuard]
  },

  // ── Zone protégée (layout avec sidebar) ───────────────────────
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [IsAuthenticateGuard],
    canActivateChild: [IsAuthenticateGuard],
    children: [
      // Redirection racine
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ── Pages ADMIN ─────────────────────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Dashboard' }
      },
      {
        path: 'users',
        loadComponent: () => import('./views/users/users').then(m => m.UsersComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Utilisateurs' }
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./views/users/user-detail').then(m => m.UserDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Détail utilisateur' }
      },
      {
        path: 'organizer-requests',
        loadComponent: () => import('./views/organizer-requests/organizer-requests').then(m => m.OrganizerRequestsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Demandes organisateurs' }
      },
      {
        path: 'organizer-requests/:userId',
        loadComponent: () => import('./views/organizer-requests/organizer-request-detail').then(m => m.OrganizerRequestDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Détail demande organisateur' }
      },
      {
        path: 'profiles',
        loadComponent: () => import('./views/profiles/profiles').then(m => m.ProfilesComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Profils' }
      },
      {
        path: 'profiles/:id',
        loadComponent: () => import('./views/profiles/profile-detail').then(m => m.ProfileDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Détail profil' }
      },
      {
        path: 'validations',
        loadComponent: () => import('./views/validations/validations').then(m => m.ValidationsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Validations' }
      },
      {
        path: 'stats',
        loadComponent: () => import('./views/stats/stats').then(m => m.StatsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Statistiques' }
      },

      // ── Paramètres (accessible à tout utilisateur connecté) ─────
      {
        path: 'settings',
        loadComponent: () => import('./views/settings/settings').then(m => m.SettingsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'], title: 'Paramètres' }
      },

      // ── Page d'erreur d'accès ────────────────────────────────────
      {
        path: 'unauthorized',
        loadComponent: () => import('./views/unauthorized/unauthorized').then(m => m.UnauthorizedComponent),
        data: { title: 'Accès refusé' }
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];
