import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { OrganizerRequest } from '../../core/models/organizer/organizer.model';
import { PaginatedResponse } from '../../core/models/admin/admin-dto.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-organizer-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizer-requests.html',
  styleUrls: ['./organizer-requests.scss']
})
export class OrganizerRequestsComponent implements OnInit {
  protected svc = inject(AdminService);
  protected toast = inject(ToastService);

  // Données
  requests: OrganizerRequest[] = [];
  loading = false;

  // Pagination & Filtrage
  page = 0;
  size = 10;
  total = 0;
  selectedStatus = ''; // '': tous, 'PENDING': en attente, 'APPROVED': approuvés, 'REJECTED': rejetés

  // Modales
  showDecision = false;
  selectedRequest: OrganizerRequest | null = null;
  isApproving = false;
  rejectionReason = '';

  ngOnInit(): void {
    this.load();
  }

  /**
   * Charge la liste des demandes organizer avec pagination et filtres
   */
  load(): void {
    this.loading = true;
    this.svc.getOrganizerRequests(this.page, this.size, this.selectedStatus) .pipe(finalize(() => this.loading = false)).subscribe({
     next: (response) => {
  if (!response.data) return;

  const data: any = response.data;

  // 🔥 CAS 1: backend comme users
  if (data.requests) {
    this.requests = data.requests;
    this.total = data.requests.length;
    return;
  }

  // 🔥 CAS 2: autre nom possible
  if (data.organizerRequests) {
    this.requests = data.organizerRequests;
    this.total = data.organizerRequests.length;
    return;
  }

  // 🔥 CAS 3: pagination propre
  if (data.content) {
    this.requests = data.content;
    this.total = data.totalElements ?? data.content.length;
    return;
  }

  // fallback
  this.requests = [];
  this.total = 0;
},
      error: () => {
        this.toast.show('error', 'Erreur lors du chargement des demandes');
        this.loading = false;
      }

    });
  }

  // ─────────────────────────────────────────────
  // MODAL ACTIONS
  // ─────────────────────────────────────────────

  /**
   * Ouvre la modale de décision (approbation/rejet)
   */
  openDecision(request: OrganizerRequest, approve: boolean): void {
    this.selectedRequest = request;
    this.isApproving = approve;
    this.rejectionReason = '';
    this.showDecision = true;
  }

  /**
   * Valide la décision (approbation ou rejet)
   */
  confirmDecision(): void {
    if (!this.selectedRequest?.userId) {
      return;
    }

    // Validation: si rejet, une raison est obligatoire
    if (!this.isApproving && !this.rejectionReason.trim()) {
      this.toast.show('warning', 'Veuillez indiquer la raison du rejet');
      return;
    }

    const rejectionReasonOrNull = this.isApproving ? null : this.rejectionReason.trim();

    this.svc.decideOrganizerRequest(
      this.selectedRequest.userId,
      this.isApproving,
      rejectionReasonOrNull
    ).subscribe({
      next: () => {
        const message = this.isApproving
          ? 'Demande approuvée et rôle ORGANIZER attribué'
          : 'Demande rejetée';
        this.toast.show('success', message);
        this.showDecision = false;
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de la décision';
        this.toast.show('error', msg);
      }
    });
  }

  // ─────────────────────────────────────────────
  // VIEW DETAILS
  // ─────────────────────────────────────────────

  /**
   * Ouvre un nouvel onglet pour voir le profil et le document
   */
  viewDetails(request: OrganizerRequest): void {
    // Implémentation future: modal ou redirection
    console.log('Détails de la demande:', request);
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  /**
   * Retourne le label du statut avec couleur appropriée
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté'
    };
    return labels[status] || status;
  }

  /**
   * Retourne la classe CSS pour le badge de statut
   */
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-success',
      'REJECTED': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  /**
   * Retourne les initiales du nom pour l'avatar
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  /**
   * Formate la date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
