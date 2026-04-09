import { Routes } from '@angular/router';
import { IsAuthenticateGuard } from './shared/guards/isAuth.guard';
import { IsGuestGuard } from './shared/guards/isGuest.guard';
import { RoleGuard } from './shared/guards/Role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/auth/login/login').then(m => m.LoginComponent),
    canActivate: [IsGuestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [IsAuthenticateGuard],
    children: [
      { path: 'dashboard',      loadComponent: () => import('./views/dashboard/dashboard').then(m => m.DashboardComponent),          canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'users',          loadComponent: () => import('./views/users/users').then(m => m.UsersComponent),                      canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'organizer-requests', loadComponent: () => import('./views/organizer-requests/organizer-requests').then(m => m.OrganizerRequestsComponent), canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'events',        loadComponent: () => import('./views/events/events').then(m => m.EventsComponent),                   canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'billing',       loadComponent: () => import('./views/billing/billing').then(m => m.BillingComponent),                canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'payments',      loadComponent: () => import('./views/payments/payments').then(m => m.PaymentsComponent),             canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'notifications', loadComponent: () => import('./views/notifications/notifications').then(m => m.NotificationsComponent), canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'freemium',      loadComponent: () => import('./views/freemium/freemium').then(m => m.FreemiumComponent),             canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'unauthorized', loadComponent: () => import('./views/unauthorized/unauthorized').then(m => m.UnauthorizedComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
