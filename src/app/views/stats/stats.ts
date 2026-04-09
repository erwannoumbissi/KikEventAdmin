import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import ResponseType from '../../core/models/api_resp.model';
import { DashboardStats } from '../../core/models/kikevent.models';

declare const Chart: any;

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrls: ['./stats.scss']
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('growthChart') growthRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('repartitionChart') repartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('conversionChart') convRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(AdminService);

  stats: DashboardStats = this.defaultStats();
  loading = true;
  chartsReady = false;

  // Données calculées pour la vue
  get conversionRate(): string {
    return this.stats.totalUsers > 0
      ? ((this.stats.ticketsSold / (this.stats.totalUsers * 3)) * 100).toFixed(1)
      : '0';
  }

  get revenueParBillet(): number {
    return this.stats.ticketsSold > 0
      ? Math.round(this.stats.totalRevenue / this.stats.ticketsSold)
      : 0;
  }

  get croissanceMensuelle(): string {
    const rev = this.stats.monthlyRevenue;
    if (rev.length < 2) return '0';
    const last = rev[rev.length - 1];
    const prev = rev[rev.length - 2];
    return prev > 0 ? (((last - prev) / prev) * 100).toFixed(1) : '0';
  }

  ngOnInit(): void {
    this.svc.getDashboardStats().subscribe({
      next: (r: ResponseType<any>) => { this.stats = r.data ?? this.defaultStats(); },
      error: () => { this.stats = this.defaultStats(); },
      complete: () => {
        this.loading = false;
        if (this.chartsReady) this.renderCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    this.loadChartJS().then(() => {
      if (!this.loading) this.renderCharts();
      else {
        const t = setInterval(() => {
          if (!this.loading) { this.renderCharts(); clearInterval(t); }
        }, 200);
      }
    });
  }

  private loadChartJS(): Promise<void> {
    if ((window as any)['Chart']) return Promise.resolve();
    return new Promise(res => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      s.onload = () => res();
      document.head.appendChild(s);
    });
  }

  private renderCharts(): void {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const grid   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const ticks  = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.4)';

    // Graphique 1 — Courbe de croissance des revenus
    if (this.growthRef?.nativeElement) {
      new Chart(this.growthRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.stats.revenueLabels,
          datasets: [
            {
              label: 'Revenus (k FCFA)',
              data: this.stats.monthlyRevenue,
              borderColor: '#5B4CF5',
              backgroundColor: 'rgba(91,76,245,0.08)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#5B4CF5',
              pointRadius: 4
            },
            {
              label: 'Commissions (k FCFA)',
              data: this.stats.monthlyRevenue.map((v: number) => +(v * 0.05).toFixed(1)),
              borderColor: '#1D9E75',
              backgroundColor: 'rgba(29,158,117,0.06)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#1D9E75',
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: ticks, font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: ticks, font: { size: 11 } } },
            y: { grid: { color: grid }, ticks: { color: ticks, font: { size: 11 }, callback: (v: number) => v + 'k' }, border: { display: false } }
          }
        }
      });
    }

    // Graphique 2 — Répartition par rôle (Doughnut)
    if (this.repartRef?.nativeElement) {
      new Chart(this.repartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: this.stats.usersByRole.map((r: any) => r.role),
          datasets: [{
            data: this.stats.usersByRole.map((r: any) => r.count),
            backgroundColor: ['#5B4CF5', '#1D9E75', '#EF9F27', '#378ADD'],
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

    // Graphique 3 — Barres horizontales billets par mois
    if (this.convRef?.nativeElement) {
      const ticketData = this.stats.monthlyRevenue.map((v: number) => Math.round(v * 4.4));
      new Chart(this.convRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.stats.revenueLabels,
          datasets: [{
            label: 'Billets vendus',
            data: ticketData,
            backgroundColor: '#9FE1CB',
            borderRadius: 4,
            barPercentage: 0.65
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: ticks, font: { size: 10 } }, border: { display: false } },
            y: { grid: { display: false }, ticks: { color: ticks, font: { size: 10 } } }
          }
        }
      });
    }
  }

  private defaultStats(): DashboardStats {
    return {
      totalUsers: 2847, totalOrganizers: 134, totalParticipants: 2600,
      activeEvents: 143, ticketsSold: 18402, totalRevenue: 4200000, pendingValidations: 7,
      monthlyRevenue: [850, 980, 760, 1200, 1560, 1340, 1200, 1480, 1820, 1950, 2100, 2800],
      revenueLabels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      usersByRole: [
        { role: 'Admin', count: 3 },
        { role: 'Organisateurs', count: 134 },
        { role: 'Contrôleurs', count: 110 },
        { role: 'Participants', count: 2600 }
      ],
      recentActivity: []
    };
  }
}
