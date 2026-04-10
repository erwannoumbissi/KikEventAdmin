import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { OrganizerRequest } from '../../core/models/organizer/organizer.model';
import { extractContent } from '../../shared/helpers/api.helper';

@Component({
  selector: 'app-validations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validations.html',
  styleUrls: ['./validations.scss']
})
export class ValidationsComponent implements OnInit {
  private svc   = inject(AdminService);
  private toast = inject(ToastService);

  all      : OrganizerRequest[] = [];
  displayed: OrganizerRequest[] = [];
  loading  = false;

  activeTab: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';

  tabs = [
    { key: 'PENDING'  as const, label: 'En attente',  count: 0 },
    { key: 'APPROVED' as const, label: 'Approuvées',  count: 0 },
    { key: 'REJECTED' as const, label: 'Rejetées',    count: 0 }
  ];

  showPanel  = false;
  showReject = false;
  selected   : OrganizerRequest | null = null;
  rejectMotif = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getOrganizerRequests().subscribe({
      next: r => {
        this.all = extractContent<OrganizerRequest>(r.data as any);
        this.tabs[0].count = this.all.filter(x => x.status === 'PENDING').length;
        this.tabs[1].count = this.all.filter(x => x.status === 'APPROVED').length;
        this.tabs[2].count = this.all.filter(x => x.status === 'REJECTED').length;
        this.filter();
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  setTab(key: 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    this.activeTab = key;
    this.filter();
  }

  private filter(): void {
    this.displayed = this.all.filter(r => r.status === this.activeTab);
  }

  openDetail(r: OrganizerRequest): void { this.selected = r; this.showPanel = true; }
  openReject(r: OrganizerRequest): void { this.selected = r; this.rejectMotif = ''; this.showReject = true; }

  approve(r: OrganizerRequest): void {
    this.svc.decideOrganizerRequest(r.userId, true, null).subscribe({
      next: () => { this.toast.show('success', 'Demande approuvée !'); this.showPanel = false; this.load(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur approbation'); }
    });
  }

  confirmReject(): void {
    if (!this.selected || !this.rejectMotif.trim()) { return; }
    this.svc.decideOrganizerRequest(this.selected.userId, false, this.rejectMotif.trim()).subscribe({
      next: () => { this.toast.show('info', 'Demande rejetée.'); this.showReject = false; this.showPanel = false; this.load(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur rejet'); }
    });
  }

  initials(name: string): string {
    return (name || '?').split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
  }

  statusClass(s: string): string {
    return ({ PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger' } as Record<string,string>)[s] ?? '';
  }
}
