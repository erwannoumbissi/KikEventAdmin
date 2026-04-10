import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import ResponseType from '../../core/models/api_resp.model';
import { Billet } from '../../core/models/kikevent.models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrls: ['./billing.scss']
})
export class BillingComponent implements OnInit {

  protected svc = inject(AdminService);
  protected toast = inject(ToastService);

  billets: Billet[] = [];
  loading = false;
  activeTab = 'ALL';

  tabs = [
    { key: 'ALL', label: 'Tous' },
    { key: 'VALIDE', label: 'Valides' },
    { key: 'UTILISE', label: 'Utilisés' },
    { key: 'ANNULE', label: 'Annulés' },
    { key: 'REMBOURSE', label: 'Remboursés' }
  ];

  ngOnInit(): void {
    this.load();
  }

  setTab(k: string): void {
    this.activeTab = k;
    this.load();
  }

  load(): void {
    this.loading = true;

    const status = this.activeTab === 'ALL' ? '' : this.activeTab;

    this.svc.getBillets(status).subscribe({
      next: (r: ResponseType<any>) => {

        const data = r?.data;

        if (!data) {
          this.billets = this.mock();
          return;
        }

        // CAS 1: pagination backend
        if (Array.isArray(data.content)) {
          this.billets = data.content;
          return;
        }

        // CAS 2: liste directe
        if (Array.isArray(data)) {
          this.billets = data;
          return;
        }

        // fallback
        this.billets = this.mock();
      },

      error: (err) => {
        console.error('Billing API error:', err);
        this.toast.show('error', 'Erreur chargement billets');
        this.billets = this.mock();
        this.loading = false;
      },

      complete: () => {
        this.loading = false;
      }
    });
  }

  refund(b: Billet): void {
    this.svc.refundBillet(b.id).subscribe({
      next: () => {
        this.toast.show('success', `Billet #${b.id} remboursé.`);
        this.load();
      },
      error: () => {
        this.toast.show('error', 'Erreur remboursement');
      }
    });
  }

  private mock(): Billet[] {
    return [
      {
        id: 1,
        type: 'Standard',
        prix: 15000,
        statut: 'VALIDE',
        evenementId: 1,
        evenementTitre: 'Soirée Jazz',
        acheteurNom: 'Jean Kamga',
        acheteurEmail: 'jean@cm',
        createdAt: '2025-04-01'
      },
      {
        id: 2,
        type: 'VIP',
        prix: 50000,
        statut: 'UTILISE',
        evenementId: 2,
        evenementTitre: 'Concert Afro',
        acheteurNom: 'Marie Ngok',
        acheteurEmail: 'marie@cm',
        createdAt: '2025-04-02'
      },
      {
        id: 3,
        type: 'Standard',
        prix: 8000,
        statut: 'REMBOURSE',
        evenementId: 3,
        evenementTitre: 'Festival',
        acheteurNom: 'Paul Jr',
        acheteurEmail: 'paul@cm',
        createdAt: '2025-04-03'
      },
      {
        id: 4,
        type: 'Standard',
        prix: 12000,
        statut: 'ANNULE',
        evenementId: 4,
        evenementTitre: 'Tech Summit',
        acheteurNom: 'Alice Ctrl',
        acheteurEmail: 'alice@cm',
        createdAt: '2025-04-04'
      }
    ];
  }
}
