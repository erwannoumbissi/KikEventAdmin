import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ResponseType } from '../../core/models/api_resp.model';
import { DashboardStats } from '../../core/models/kikevent.models';
import { Chart, registerables } from 'chart.js';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('revenueChart') rcRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rolesChart') rdRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(AdminService);

  stats: DashboardStats = this.getEmptyStats();
  loading = true;
  chartsReady = false;



  // ngOnInit(): void {
  //   this.svc.getDashboardStats()
  //     .pipe(
  //       catchError((err) => {
  //         console.warn('API indisponible → mock data utilisée', err);

  //         // ✅ retourne une réponse simulée
  //         return of({
  //           data: this.getMockStats()
  //         } as ResponseType<any>);
  //       }),

  //       finalize(() => {
  //         this.loading = false;

  //         if (this.chartsReady) {
  //           setTimeout(() => this.render(), 0);
  //         }
  //       })
  //     )
  //     .subscribe((r: ResponseType<any>) => {

  //       const data = r?.data;

  //       // ✅ fallback propre même si data = null
  //       if (!data) {
  //         this.stats = this.getMockStats();
  //         return;
  //       }

  //       this.stats = {
  //         ...this.getEmptyStats(),
  //         ...data,
  //         monthlyRevenue: data.monthlyRevenue ?? [],
  //         revenueLabels: data.revenueLabels ?? [],
  //         usersByRole: data.usersByRole ?? [],
  //         recentActivity: data.recentActivity ?? []
  //       };
  //     });
  // }

  ngOnInit(): void {

    // 🔥 MODE MOCK
    if (environment.useMock) {
      console.warn('⚠️ MODE MOCK ACTIVÉ');

      this.stats = this.getMockStats();
      this.loading = false;

      if (this.chartsReady) {
        setTimeout(() => this.render(), 0);
      }

      return;
    }

    // 🚀 MODE API
    this.svc.getDashboardStats()
      .pipe(
        catchError((err) => {
          console.warn('API indisponible → fallback mock', err);

          return of({
            data: this.getMockStats()
          } as ResponseType<any>);
        }),

        finalize(() => {
          this.loading = false;

          if (this.chartsReady) {
            setTimeout(() => this.render(), 0);
          }
        })
      )
      .subscribe((r: ResponseType<any>) => {

        const data = r?.data;

        if (!data) {
          this.stats = this.getMockStats();
          return;
        }

        this.stats = {
          ...this.getEmptyStats(),
          ...data,
          monthlyRevenue: data.monthlyRevenue ?? [],
          revenueLabels: data.revenueLabels ?? [],
          usersByRole: data.usersByRole ?? [],
          recentActivity: data.recentActivity ?? []
        };
      });
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;

    setTimeout(() => {
      if (!this.loading) this.render();
    }, 300);
  }

  private render(): void {

    if (!this.rcRef || !this.rdRef) return; // ✅ sécurité

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const ticks = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

    // ✅ destroy old charts
    Chart.getChart(this.rcRef.nativeElement)?.destroy();
    Chart.getChart(this.rdRef.nativeElement)?.destroy();

    // 📊 REVENUE CHART
    new Chart(this.rcRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.stats.revenueLabels,
        datasets: [
          {
            label: 'Revenus',
            data: this.stats.monthlyRevenue,
            backgroundColor: '#5B4CF5',
            borderRadius: 5,
            barPercentage: 0.6
          },
          {
            label: 'Commissions',
            data: this.stats.monthlyRevenue.map(v => +(v * 0.05).toFixed(1)),
            backgroundColor: '#9FE1CB',
            borderRadius: 5,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: ticks, font: { size: 11 } }
          },
          y: {
            grid: { color: grid },
            ticks: {
              color: ticks,
              font: { size: 11 },
              callback: (v) => typeof v === 'number' ? v + 'k' : v
            },
            border: { display: false }
          }
        }
      }
    });

    // 🍩 ROLE CHART
    const roles = this.stats.usersByRole;

    new Chart(this.rdRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: roles.map(r => r.role),
        datasets: [
          {
            data: roles.map(r => r.count),
            backgroundColor: ['#5B4CF5', '#1D9E75', '#EF9F27', '#378ADD'],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { display: false } }
      }
    });
  }

  private getEmptyStats(): DashboardStats {
    return {
      totalUsers: 0,
      totalOrganizers: 0,
      totalParticipants: 0,
      activeEvents: 0,
      ticketsSold: 0,
      totalRevenue: 0,
      pendingValidations: 0,
      monthlyRevenue: [],
      revenueLabels: [],
      usersByRole: [],
      recentActivity: []
    };
  }

  private getMockStats(): DashboardStats {
    return {
      totalUsers: 1240,
      totalOrganizers: 87,
      totalParticipants: 1153,
      activeEvents: 42,
      ticketsSold: 8920,
      totalRevenue: 12500000,
      pendingValidations: 6,
      monthlyRevenue: [120, 180, 240, 300, 260, 310],
      revenueLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      usersByRole: [
        { role: 'PARTICIPANT', count: 1100 },
        { role: 'ORGANIZER', count: 87 },
        { role: 'ADMIN', count: 5 },
        { role: 'CONTROLER', count: 48 }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'USER_REGISTERED',
          description: 'Nouvel utilisateur inscrit',
          timestamp: '2025-04-10T10:00:00Z'
        },
        {
          id: 2,
          type: 'EVENT_VALIDATED',
          description: 'Événement validé par admin',
          timestamp: '2025-04-10T09:30:00Z'
        },
        {
          id: 3,
          type: 'TICKET_REFUNDED',
          description: 'Remboursement effectué',
          timestamp: '2025-04-10T08:15:00Z'
        }
      ]
    };
  }

  // 🎨 ICON MAPPING
  aIcon(type: string) {
    const map: any = {
      USER_REGISTERED: { bg: '#e6f0ff', color: '#3498db' },
      EVENT_VALIDATED: { bg: '#e6ffed', color: '#2ecc71' },
      TICKET_REFUNDED: { bg: '#ffe6e6', color: '#e74c3c' }
    };

    return map[type] || { bg: '#eee', color: '#333' };
  }
}
