import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { Evenement } from '../../core/models/kikevent.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.scss']
})
export class EventsComponent implements OnInit {

  protected svc = inject(AdminService);
  protected toast = inject(ToastService);

  events: Evenement[] = [];
  loading = false;

  activeTab = 'ALL';
  searchTerm = '';

  page = 0;
  size = 10;
  total = 0;

  showRefuse = false;
  refuseTarget: Evenement | null = null;
  refuseMotif = '';

  tabs = [
    { key: 'ALL', label: 'Tous' },
    { key: 'PENDING', label: 'En attente' },
    { key: 'VALIDATED', label: 'Validés' },
    { key: 'REFUSED', label: 'Refusés' }
  ];

  ngOnInit(): void {
    this.load();
  }

  setTab(k: string): void {
    this.activeTab = k;
    this.page = 0;
    this.load();
  }

  load(): void {
    this.loading = true;

    const status = this.activeTab === 'ALL' ? '' : this.activeTab;

    this.svc.getEvents(status, this.page, this.size, this.searchTerm)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (r: any) => {

          const data = r?.data;

          if (!data) {
            this.events = this.mock();
            this.total = this.events.length;
            return;
          }

          // CAS 1: pagination backend
          if (Array.isArray(data.content)) {
            this.events = data.content;
            this.total = data.totalElements ?? data.content.length;
            return;
          }

          // CAS 2: liste directe
          if (Array.isArray(data)) {
            this.events = data;
            this.total = data.length;
            return;
          }

          // fallback final
          this.events = this.mock();
          this.total = this.events.length;
        },

        error: () => {
          this.toast.show('error', 'Erreur lors du chargement des événements');
          this.events = this.mock();
          this.total = this.events.length;
        }
      });
  }

  validate(e: Evenement): void {
    this.svc.validateEvent(e.id).subscribe({
      next: () => {
        this.toast.show('success', `"${e.titre}" validé !`);
        this.load();
      },
      error: () => {
        this.toast.show('error', 'Erreur validation');
      }
    });
  }

  openRefuse(e: Evenement): void {
    this.refuseTarget = e;
    this.refuseMotif = '';
    this.showRefuse = true;
  }

  confirmRefuse(): void {
    if (!this.refuseTarget || !this.refuseMotif.trim()) return;

    this.svc.refuseEvent(this.refuseTarget.id, this.refuseMotif)
      .subscribe({
        next: () => {
          this.toast.show('info', "Événement refusé. Organisateur notifié.");
          this.showRefuse = false;
          this.load();
        },
        error: () => {
          this.toast.show('error', 'Erreur refus');
        }
      });
  }

  private mock(): Evenement[] {
    return [
      {
        id: 1,
        titre: 'Soirée Jazz Yaoundé',
        description: '',
        date: '2025-04-15',
        lieu: 'Centre Culturel',
        statut: 'VALIDATED',
        capacite: 300,
        billetsVendus: 248,
        organisateurId: 10,
        organisateurNom: 'Kamga Events',
        createdAt: '2025-04-01'
      },
      {
        id: 2,
        titre: 'Concert Afrobeats',
        description: '',
        date: '2025-04-22',
        lieu: 'Palais des Sports',
        statut: 'PENDING',
        capacite: 1000,
        billetsVendus: 512,
        organisateurId: 11,
        organisateurNom: 'Yannick Prod',
        createdAt: '2025-04-03'
      },
      {
        id: 3,
        titre: 'Tech Summit 2025',
        description: '',
        date: '2025-05-01',
        lieu: 'Hilton Yaoundé',
        statut: 'VALIDATED',
        capacite: 200,
        billetsVendus: 180,
        organisateurId: 12,
        organisateurNom: 'TechHub CM',
        createdAt: '2025-04-02'
      },
      {
        id: 4,
        titre: 'Festival Culturel',
        description: '',
        date: '2025-05-10',
        lieu: 'Place Ahmadou',
        statut: 'REFUSED',
        capacite: 5000,
        billetsVendus: 0,
        organisateurId: 13,
        organisateurNom: 'CultArt CM',
        createdAt: '2025-03-28'
      }
    ];
  }
}
