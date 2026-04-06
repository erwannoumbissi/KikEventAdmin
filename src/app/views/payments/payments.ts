import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { Paiement } from '../../core/models/kikevent.models';
@Component({ selector: 'app-payments', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './payments.html', styleUrls: ['./payments.scss'] })
export class PaymentsComponent implements OnInit {
  protected svc = inject(AdminService); protected toast = inject(ToastService);
  payments: Paiement[] = []; loading = false; activeTab = 'ALL'; dateDebut = ''; dateFin = '';
  tabs = [{key:'ALL',label:'Toutes'},{key:'SUCCES',label:'Succès'},{key:'EN_ATTENTE',label:'En attente'},{key:'REMBOURSE',label:'Remboursés'}];
  get totalRevenu(): number { return this.payments.filter(p => p.statut==='SUCCES').reduce((s,p) => s+p.montant, 0); }
  get totalCommission(): number { return this.payments.filter(p => p.statut==='SUCCES').reduce((s,p) => s+p.commission, 0); }
  ngOnInit(): void { this.load(); }
  setTab(k: string): void { this.activeTab = k; this.load(); }
  load(): void {
    this.loading = true;
    const s = this.activeTab === 'ALL' ? '' : this.activeTab;
    this.svc.getPayments(s).subscribe({
      next: r => { this.payments = r.data?.content ?? r.data ?? this.mock(); },
      error: () => { this.payments = this.mock(); this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
  exportReport(): void {
    if (!this.dateDebut || !this.dateFin) { this.toast.show('warning', 'Veuillez sélectionner une période.'); return; }
    this.svc.generateFinancialReport(this.dateDebut, this.dateFin).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = `rapport_${this.dateDebut}_${this.dateFin}.pdf`; a.click(); URL.revokeObjectURL(url);
        this.toast.show('success', 'Rapport téléchargé !');
      },
      error: () => { this.toast.show('info', 'Rapport (backend requis)'); }
    });
  }
  private mock(): Paiement[] {
    return [
      {id:1,reference:'TXN-001',montant:15000,commission:750,statut:'SUCCES',methode:'PayMooney',billetId:1,evenementTitre:'Soirée Jazz',payeurNom:'Jean Kamga',date:'2025-04-05'},
      {id:2,reference:'TXN-002',montant:25000,commission:1250,statut:'SUCCES',methode:'MTN MoMo',billetId:2,evenementTitre:'Concert Afro',payeurNom:'Marie Ngok',date:'2025-04-04'},
      {id:3,reference:'TXN-003',montant:8000,commission:400,statut:'REMBOURSE',methode:'PayMooney',billetId:3,evenementTitre:'Festival',payeurNom:'Paul Jr',date:'2025-04-03'},
      {id:4,reference:'TXN-004',montant:12000,commission:600,statut:'EN_ATTENTE',methode:'Orange Money',billetId:4,evenementTitre:'Tech Summit',payeurNom:'Alice Ctrl',date:'2025-04-05'},
    ];
  }
}