import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user/User.model';
import { OrganizerRequest } from '../../core/models/organizer/organizer.model';
import { extractContent } from '../../shared/helpers/api.helper';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrls: ['./stats.scss']
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('rolesChart') rolesRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(AdminService);

  loading     = true;
  chartsReady = false;
  chartDrawn  = false;

  totalUsers     = 0;
  activeUsers    = 0;
  suspendedUsers = 0;
  totalOrgs      = 0;
  totalParts     = 0;
  totalAdmins    = 0;
  totalCtrls     = 0;

  pendingReqs  = 0;
  approvedReqs = 0;
  rejectedReqs = 0;

  usersByRole: { role: string; count: number; color: string }[] = [];

  ngOnInit(): void {
    Promise.all([
      this.svc.getUsers().pipe(catchError(() => of(null))).toPromise(),
      this.svc.getOrganizerRequests().pipe(catchError(() => of(null))).toPromise()
    ]).then(([ur, rr]) => {
      if (ur?.data) {
        const list = extractContent<User>(ur.data as any);
        this.totalUsers     = (ur.data as any).totalElements ?? list.length;
        this.activeUsers    = list.filter(u => u.enabled).length;
        this.suspendedUsers = list.filter(u => !u.enabled).length;
        let adm = 0, org = 0, ctrl = 0, part = 0;
        list.forEach(u => {
          const n = (u.roles ?? []).map(r => r.name);
          if (n.includes('ADMIN'))       adm++;
          if (n.includes('ORGANIZER'))   org++;
          if (n.includes('CONTROLER'))   ctrl++;
          if (n.includes('PARTICIPANT')) part++;
        });
        this.totalAdmins = adm; this.totalOrgs = org; this.totalCtrls = ctrl; this.totalParts = part;
        this.usersByRole = [
          { role: 'Admins',        count: adm,  color: '#5B4CF5' },
          { role: 'Organisateurs', count: org,  color: '#1D9E75' },
          { role: 'Contrôleurs',   count: ctrl, color: '#EF9F27' },
          { role: 'Participants',  count: part, color: '#378ADD' }
        ].filter(r => r.count > 0);
      }
      if (rr?.data) {
        const list = extractContent<OrganizerRequest>(rr.data as any);
        this.pendingReqs  = list.filter(r => r.status === 'PENDING').length;
        this.approvedReqs = list.filter(r => r.status === 'APPROVED').length;
        this.rejectedReqs = list.filter(r => r.status === 'REJECTED').length;
      }
      this.loading = false;
      if (this.chartsReady) { this.renderChart(); }
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
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { color: ticks, font: { size: 11 }, padding: 14 } } }
      }
    });
  }

  pct(v: number, total: number): string {
    return total > 0 ? ((v / total) * 100).toFixed(1) : '0';
  }
}
