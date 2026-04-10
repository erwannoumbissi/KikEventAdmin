import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';

@Component({
  selector: 'app-validations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validations.html',
  styleUrls: ['./validations.scss']
})
export class ValidationsComponent implements OnInit {
  protected svc   = inject(AdminService);
  protected toast = inject(ToastService);

  all: any[] = [];
  requests: any[] = [];
  loading = false;
  activeTab: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
  selected: any | null = null;
  showPanel = false;
  showReject = false;
  rejectMotif = '';
  rejectTarget: any | null = null;

  tabs = [
    { key: 'PENDING',  label: 'En attente',  count: 0 },
    { key: 'APPROVED', label: 'Approuvées',  count: 0 },
    { key: 'REJECTED', label: 'Rejetées',    count: 0 }
  ];

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    // GET /admin/organizer-requests
    this.svc.getOrganizerRequests().subscribe({
      next: r => {
        this.all = r.data?.content ?? r.data ?? [];
        this.refresh();
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  refresh(): void {
    this.tabs[0].count = this.all.filter(x => x.statut === 'PENDING').length;
    this.tabs[1].count = this.all.filter(x => x.statut === 'APPROVED').length;
    this.tabs[2].count = this.all.filter(x => x.statut === 'REJECTED').length;
    this.requests = this.all.filter(r => r.statut === this.activeTab);
  }

  setTab(t: { key: string }): void { this.activeTab = t.key as any; this.refresh(); }
  openDetail(r: any): void { this.selected = r; this.showPanel = true; }

  /**
   * PATCH /admin/organizer-requests/{userId}/decision
   * Body: { approved: true, rejectionReason: null }
   */
  approve(r: any): void {
    // Le backend attend l'userId (pas l'id de la demande)
    const userId = r.userId ?? r.id;
    this.svc.decideOrganizerRequest(userId, true, null).subscribe({
      next: () => {
        this.toast.show('success', `Demande approuvée !`);
        this.showPanel = false;
        this.loadAll();
      },
      error: () => { this.toast.show('error', "Erreur approbation"); }
    });
  }

  openReject(r: any): void { this.rejectTarget = r; this.rejectMotif = ''; this.showReject = true; }

  /**
   * PATCH /admin/organizer-requests/{userId}/decision
   * Body: { approved: false, rejectionReason: "motif" }
   */
  confirmReject(): void {
    if (!this.rejectTarget || !this.rejectMotif.trim()) { return; }
    const userId = this.rejectTarget.userId ?? this.rejectTarget.id;
    this.svc.decideOrganizerRequest(userId, false, this.rejectMotif).subscribe({
      next: () => {
        this.toast.show('info', 'Demande rejetée.');
        this.showReject = false;
        this.showPanel = false;
        this.loadAll();
      },
      error: () => { this.toast.show('error', 'Erreur rejet'); }
    });
  }

  docLabel(t: string): string {
    const m: Record<string, string> = { CNI: 'CNI', RCCM: 'RCCM', REGISTRE_COMMERCE: 'RC', STATUTS: 'Statuts', AUTRE: 'Autre' };
    return m[t] ?? t;
  }
}
