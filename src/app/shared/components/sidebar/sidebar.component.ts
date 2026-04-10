import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { UserHelper } from '../../helpers/user';
import { Router } from '@angular/router';
import { extractContent } from '../../helpers/api.helper';
import { OrganizerRequest } from '../../../core/models/organizer/organizer.model';

interface NavItem {
  section   : string;
  label     : string;
  route     : string;
  icon      : string;
  badge     : number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private auth      = inject(AuthService);
  private svc       = inject(AdminService);
  private router    = inject(Router);
  private sanitizer = inject(DomSanitizer);

  adminName  = 'Administrateur';
  adminEmail = '';

  navItems: NavItem[] = [
    { section: 'Principal',  label: 'Dashboard',              route: '/dashboard',          icon: 'grid',        badge: 0 },
    { section: '',           label: 'Utilisateurs',           route: '/users',              icon: 'users',       badge: 0 },
    { section: '',           label: 'Profils',                route: '/profiles',           icon: 'id-card',     badge: 0 },
    { section: '',           label: 'Demandes organisateurs', route: '/organizer-requests', icon: 'file-text',   badge: 0 },
    { section: '',           label: 'Statistiques',           route: '/stats',              icon: 'bar-chart',   badge: 0 },
    { section: 'Système',    label: 'Validations',            route: '/validations',        icon: 'check-square',badge: 0 },
    { section: '',           label: 'Paramètres',             route: '/settings',           icon: 'settings',    badge: 0 },
  ];

  ngOnInit(): void {
    const stored = UserHelper.getUser() as any;
    if (stored) {
      this.adminName  = stored.username ?? 'Admin';
      this.adminEmail = stored.email    ?? '';
    }
    // Badge dynamique — demandes en attente
    this.svc.getOrganizerRequests()
      .pipe(catchError(() => of(null)))
      .subscribe(r => {
        if (!r?.data) { return; }
        const list    = extractContent<OrganizerRequest>(r.data as any);
        const pending = list.filter(x => x.status === 'PENDING').length;
        const idx     = this.navItems.findIndex(n => n.route === '/organizer-requests');
        if (idx !== -1) { this.navItems[idx].badge = pending; }
      });
  }

  getInitials(): string { return (this.adminName || 'AD').substring(0, 2).toUpperCase(); }

  logout(): void {
    UserHelper.logoutUser();
    this.auth.logout();
  }

  getIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      grid:          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
      users:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
      'id-card':     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="8" cy="14" r="2"/><line x1="13" y1="14" x2="18" y2="14"/><line x1="13" y1="17" x2="18" y2="17"/></svg>`,
      'file-text':   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="8" y2="13"/><line x1="12" y1="17" x2="8" y2="17"/></svg>`,
      'bar-chart':   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      calendar:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      ticket:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 010-6h20a3 3 0 010 6H2z"/><path d="M2 12h20M5 21h14a3 3 0 003-3v-9"/></svg>`,
      'credit-card': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
      bell:          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
      'check-square': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      star:          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      settings:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[name] ?? icons['grid']);
  }
}
