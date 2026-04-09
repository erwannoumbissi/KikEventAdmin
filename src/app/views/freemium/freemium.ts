import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import ResponseType from '../../core/models/api_resp.model';
import { FreemiumConfig } from '../../core/models/kikevent.models';
@Component({ selector: 'app-freemium', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './freemium.html', styleUrls: ['./freemium.scss'] })
export class FreemiumComponent implements OnInit {
  protected svc = inject(AdminService);
  protected toast = inject(ToastService);

  cfg: FreemiumConfig = this.def();
  loading = false;
  saving = false;
  dirty = false;

  quantitativeItems: Array<{ label: string; field: keyof FreemiumConfig; unit: string; min: number; max: number }> = [
    { label: 'Max. participants par événement', field: 'maxParticipants', unit: 'participants', min: 10, max: 10000 },
    { label: 'Max. événements par mois', field: 'maxEvenementsParMois', unit: 'événements/mois', min: 1, max: 50 },
    { label: 'Max. billets par événement', field: 'maxBilletsParEvenement', unit: 'billets', min: 10, max: 5000 },
    { label: 'Durée max. d\'un événement', field: 'dureeEvenementMaxJours', unit: 'jours', min: 1, max: 30 }
  ];

  featureItems: Array<{ label: string; field: keyof FreemiumConfig; desc: string }> = [
    { label: 'Notifications push', field: 'notificationsEnabled', desc: 'Permettre l\'envoi de notifications' },
    { label: 'Tableau analytique', field: 'analyticsEnabled', desc: 'Accès aux statistiques' },
    { label: 'Export des données', field: 'exportEnabled', desc: 'Export CSV/PDF' }
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getFreemiumConfig().subscribe({
      next: (r: ResponseType<any>) => { this.cfg = r.data ?? this.def(); },
      error: () => { this.cfg = this.def(); this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  mark(): void { this.dirty = true; }

  save(): void {
    this.saving = true;
    this.svc.updateFreemiumConfig(this.cfg).subscribe({
      next: (r: ResponseType<any>) => { this.cfg = r.data ?? this.cfg; this.dirty = false; this.toast.show('success', 'Configuration mise à jour !'); },
      error: () => { this.toast.show('error', 'Erreur sauvegarde'); },
      complete: () => { this.saving = false; }
    });
  }

  reset(): void { this.load(); this.dirty = false; }

  private def(): FreemiumConfig {
    return { id: 1, maxParticipants: 100, maxEvenementsParMois: 2, maxBilletsParEvenement: 100, commissionRate: 5, dureeEvenementMaxJours: 3, notificationsEnabled: false, analyticsEnabled: false, exportEnabled: false, updatedAt: new Date().toISOString() };
  }
}