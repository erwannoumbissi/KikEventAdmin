import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { OrganizerRequest } from '../../core/models/organizer/organizer.model';
import { extractContent, extractTotal } from '../../shared/helpers/api.helper';

@Component({
  selector: 'app-organizer-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './organizer-requests.html',
  styleUrls: ['./organizer-requests.scss']
})
export class OrganizerRequestsComponent implements OnInit {
  private svc   = inject(AdminService);
  private toast = inject(ToastService);

  all      : OrganizerRequest[] = [];  // toutes les demandes chargées
  filtered : OrganizerRequest[] = [];  // filtrées par onglet
  loading  = false;
  page = 0; size = 10; total = 0;

  // Onglets
  activeTab   : 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
  tabs = [
    { key: 'ALL',      label: 'Toutes' },
    { key: 'PENDING',  label: 'En attente' },
    { key: 'APPROVED', label: 'Approuvées' },
    { key: 'REJECTED', label: 'Rejetées' }
  ] as const;

  // Modales
  showDecision = false;
  showDetail   = false;
  selected     : OrganizerRequest | null = null;
  isApproving  = false;
  rejectReason = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getOrganizerRequests().subscribe({
      next: r => {
        this.all   = extractContent<OrganizerRequest>(r.data as any);
        this.total = extractTotal<OrganizerRequest>(r.data as any);
        this.applyTab();
      },
      error: () => { this.toast.show('error', 'Erreur chargement demandes'); this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  setTab(tab: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    this.activeTab = tab;
    this.page = 0;
    this.applyTab();
  }

  private applyTab(): void {
    this.filtered = this.activeTab === 'ALL'
      ? this.all
      : this.all.filter(r => r.status === this.activeTab);
  }

  count(status: string): number {
    return this.all.filter(r => r.status === status).length;
  }

  // ── Modales ────────────────────────────────────────────────────────

  openDecision(req: OrganizerRequest, approve: boolean): void {
    this.selected    = req;
    this.isApproving = approve;
    this.rejectReason = '';
    this.showDecision = true;
  }

  openDetail(req: OrganizerRequest): void {
    this.selected  = req;
    this.showDetail = true;
  }

  close(): void {
    this.showDecision = this.showDetail = false;
    this.selected = null;
  }

  confirmDecision(): void {
    if (!this.selected?.userId) { return; }
    if (!this.isApproving && !this.rejectReason.trim()) {
      this.toast.show('warning', 'Raison du rejet requise'); return;
    }
    this.svc.decideOrganizerRequest(
      this.selected.userId,
      this.isApproving,
      this.isApproving ? null : this.rejectReason.trim()
    ).subscribe({
      next: () => {
        this.toast.show('success', this.isApproving ? 'Demande approuvée — rôle ORGANIZER attribué' : 'Demande rejetée');
        this.close();
        this.load();
      },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur décision'); }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  statusLabel(s: string): string {
    return ({ PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté' } as Record<string,string>)[s] ?? s;
  }

  statusClass(s: string): string {
    return ({ PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger' } as Record<string,string>)[s] ?? 'badge-secondary';
  }

  initials(name: string): string {
    return (name || '?').split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
  }

  get pageSlice(): OrganizerRequest[] {
    return this.filtered.slice(this.page * this.size, (this.page + 1) * this.size);
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.size)); }
}
