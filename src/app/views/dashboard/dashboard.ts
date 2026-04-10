import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user/User.model';
import { OrganizerRequest } from '../../core/models/organizer/organizer.model';
import { extractContent } from '../../shared/helpers/api.helper';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('rolesChart') rolesRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(AdminService);

  loading      = true;
  chartsReady  = false;
  chartDrawn   = false;

  // Compteurs calculés depuis les vraies données
  totalUsers        = 0;
  activeUsers       = 0;
  suspendedUsers    = 0;
  totalOrganizers   = 0;
  totalParticipants = 0;
  totalAdmins       = 0;
  totalControlers   = 0;
  pendingRequests   = 0;
  approvedRequests  = 0;
  rejectedRequests  = 0;

  recentUsers    : User[]              = [];
  pendingList    : OrganizerRequest[]  = [];
  usersByRole    : { role: string; count: number; color: string }[] = [];

  ngOnInit(): void {
    forkJoin({
      users : this.svc.getUsers().pipe(catchError(() => of(null))),
      reqs  : this.svc.getOrganizerRequests().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ users, reqs }) => {
        if (users?.data) {
          const list = extractContent<User>(users.data as any);
          this.totalUsers     = (users.data as any).totalElements ?? list.length;
          this.activeUsers    = list.filter(u => u.enabled).length;
          this.suspendedUsers = list.filter(u => !u.enabled).length;
          this.recentUsers    = list.slice(0, 6);

          let adm = 0, org = 0, ctrl = 0, part = 0;
          list.forEach(u => {
            const names = (u.roles ?? []).map(r => r.name);
            if (names.includes('ADMIN'))       adm++;
            if (names.includes('ORGANIZER'))   org++;
            if (names.includes('CONTROLER'))   ctrl++;
            if (names.includes('PARTICIPANT')) part++;
          });
          this.totalAdmins       = adm;
          this.totalOrganizers   = org;
          this.totalControlers   = ctrl;
          this.totalParticipants = part;
          this.usersByRole = [
            { role: 'Admins',        count: adm,  color: '#5B4CF5' },
            { role: 'Organisateurs', count: org,  color: '#1D9E75' },
            { role: 'Contrôleurs',   count: ctrl, color: '#EF9F27' },
            { role: 'Participants',  count: part, color: '#378ADD' }
          ].filter(r => r.count > 0);
        }

        if (reqs?.data) {
          const list = extractContent<OrganizerRequest>(reqs.data as any);
          this.pendingRequests  = list.filter(r => r.status === 'PENDING').length;
          this.approvedRequests = list.filter(r => r.status === 'APPROVED').length;
          this.rejectedRequests = list.filter(r => r.status === 'REJECTED').length;
          this.pendingList      = list.filter(r => r.status === 'PENDING').slice(0, 5);
        }

        this.loading = false;
        if (this.chartsReady) { this.renderChart(); }
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (!this.loading) { this.renderChart(); }
  }

  private renderChart(): void {
    if (this.chartDrawn || !this.rolesRef?.nativeElement || !this.usersByRole.length) { return; }
    this.chartDrawn = true;
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const ticks  = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    new Chart(this.rolesRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.usersByRole.map(r => r.role),
        datasets: [{
          data: this.usersByRole.map(r => r.count),
          backgroundColor: this.usersByRole.map(r => r.color),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { color: ticks, font: { size: 11 }, padding: 12 } } }
      }
    });
  }

  initials(name: string): string {
    return (name || '?').substring(0, 2).toUpperCase();
  }

  roleNames(user: User): string {
    return (user.roles ?? []).map(r => r.name).join(', ') || 'Aucun';
  }
}
