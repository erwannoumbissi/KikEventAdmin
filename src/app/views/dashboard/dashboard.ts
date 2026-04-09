import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import ResponseType from '../../core/models/api_resp.model';
import { DashboardStats, ActivityItem } from '../../core/models/kikevent.models';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface AIcon { bg: string; color: string; svg: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') rcRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rolesChart')   rdRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(AdminService);
  stats: DashboardStats = this.getEmptyStats();
  loading = true; chartsReady = false;

  ngOnInit(): void {
    this.svc.getDashboardStats().subscribe({
      next: (r: ResponseType<any>) => { this.stats = r.data; },
      error: () => { this.stats = this.getEmptyStats(); },
      complete: () => { this.loading = false; if (this.chartsReady) { this.render(); } }
    });
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    this.loadChart().then(() => {
      if (!this.loading) { this.render(); }
      else { const t = setInterval(() => { if (!this.loading) { this.render(); clearInterval(t); } }, 200); }
    });
  }

  private loadChart(): Promise<void> {
    // Chart.js is now imported, no need to load from CDN
    return Promise.resolve();
  }

  private render(): void {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const ticks = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    if (this.rcRef?.nativeElement) {
      new Chart(this.rcRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.stats.revenueLabels,
          datasets: [
            { label: 'Revenus', data: this.stats.monthlyRevenue, backgroundColor: '#5B4CF5', borderRadius: 5, barPercentage: 0.6 },
            { label: 'Commissions', data: this.stats.monthlyRevenue.map((v: number) => +(v * 0.05).toFixed(1)), backgroundColor: '#9FE1CB', borderRadius: 5, barPercentage: 0.6 }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false }, ticks: { color: ticks, font: { size: 11 } } },
                    y: { grid: { color: grid }, ticks: { color: ticks, font: { size: 11 }, callback: (tickValue: string | number) => typeof tickValue === 'number' ? tickValue + 'k' : tickValue }, border: { display: false } } } }
      });
    }
    if (this.rdRef?.nativeElement) {
      new Chart(this.rdRef.nativeElement, {
        type: 'doughnut',
        data: { labels: this.stats.usersByRole?.map((r: {role:string;count:number}) => r.role) || [],
                datasets: [{ data: this.stats.usersByRole?.map((r: {role:string;count:number}) => r.count) || [], backgroundColor: ['#5B4CF5','#1D9E75','#EF9F27','#378ADD'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } }
      });
    }
  }

  aIcon(type: string): AIcon {
    const m: Record<string, AIcon> = {
      USER_REGISTERED:     { bg: '#EEEDFE', color: '#5B4CF5', svg: 'user' },
      EVENT_VALIDATED:     { bg: '#E1F5EE', color: '#1D9E75', svg: 'check' },
      TICKET_REFUNDED:     { bg: '#FAEEDA', color: '#854F0B', svg: 'ticket' },
      USER_SUSPENDED:      { bg: '#FCEBEB', color: '#A32D2D', svg: 'x' },
      PAYMENT_RECEIVED:    { bg: '#E6F1FB', color: '#185FA5', svg: 'credit' },
      ONBOARDING_APPROVED: { bg: '#E1F5EE', color: '#1D9E75', svg: 'check' },
    };
    return m[type] ?? { bg: '#F1EFE8', color: '#888', svg: 'info' };
  }

  private getEmptyStats(): DashboardStats {
    return {
      totalUsers: 0, totalOrganizers: 0, totalParticipants: 0,
      activeEvents: 0, ticketsSold: 0, totalRevenue: 0, pendingValidations: 0,
      monthlyRevenue: [],
      revenueLabels: [],
      usersByRole: [],
      recentActivity: []
    };
  }
}
