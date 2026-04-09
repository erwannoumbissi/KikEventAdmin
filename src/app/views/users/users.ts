import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { User } from '../../core/models/user/User.model';
import { PaginatedResponse } from '../../core/models/admin/admin-dto.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  protected svc = inject(AdminService);
  protected toast = inject(ToastService);

  // Données
  users: User[] = [];
  loading = false;

  // Pagination & Filtrage
  page = 0;
  size = 10;
  total = 0;
  searchTerm = '';
  selectedRole = '';

  // Modales
  showSuspend = false;
  showReset = false;
  showRole = false;
  showRemoveRole = false;

  // Modales - Données
  selectedUser: User | null = null;
  suspendMotif = '';
  newRole = '';
  roleToRemove = '';

  ngOnInit(): void {
    this.load();
  }

  /**
   * Charge la liste des utilisateurs avec pagination et filtres
   */
  load(): void {
    this.loading = true;
    this.svc.getUsers(this.page, this.size, this.searchTerm, this.selectedRole).subscribe({
      next: (response) => {
        if (response.data) {
          const paginatedData = response.data as PaginatedResponse<User>;
          this.users = paginatedData.content ?? [];
          this.total = paginatedData.totalElements ?? this.users.length;
        }
      },
      error: () => {
        this.toast.show('error', 'Erreur lors du chargement des utilisateurs');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // ─────────────────────────────────────────────
  // MODAL ACTIONS
  // ─────────────────────────────────────────────

  openSuspend(user: User): void {
    this.selectedUser = user;
    this.suspendMotif = '';
    this.showSuspend = true;
  }

  openReset(user: User): void {
    this.selectedUser = user;
    this.showReset = true;
  }

  openRole(user: User): void {
    this.selectedUser = user;
    this.newRole = '';
    this.showRole = true;
  }

  openRemoveRole(user: User): void {
    this.selectedUser = user;
    this.roleToRemove = user.roles?.[0]?.name ?? '';
    this.showRemoveRole = true;
  }

  // ─────────────────────────────────────────────
  // USER STATUS MANAGEMENT
  // ─────────────────────────────────────────────

  /**
   * Suspend un utilisateur
   * PATCH /admin/users/{id}/status → { status: 'SUSPENDED' }
   */
  confirmSuspend(): void {
    if (!this.selectedUser?.id) {
      return;
    }

    this.svc.updateUserStatus(this.selectedUser.id, 'SUSPENDED').subscribe({
      next: () => {
        this.toast.show('success', 'Compte suspendu avec succès');
        this.showSuspend = false;
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de la suspension';
        this.toast.show('error', msg);
      }
    });
  }

  /**
   * Réactive un utilisateur suspendu
   * PATCH /admin/users/{id}/status → { status: 'ACTIVE' }
   */
  confirmActivate(user: User): void {
    if (!user.id) {
      return;
    }

    this.svc.updateUserStatus(user.id, 'ACTIVE').subscribe({
      next: () => {
        this.toast.show('success', 'Compte réactivé avec succès');
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de la réactivation';
        this.toast.show('error', msg);
      }
    });
  }

  // ─────────────────────────────────────────────
  // USER PASSWORD RESET
  // ─────────────────────────────────────────────

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * PATCH /admin/users/{id}/password → { newPassword }
   */
  confirmReset(): void {
    if (!this.selectedUser?.id) {
      return;
    }

    const tempPassword = prompt('Entrez le nouveau mot de passe temporaire:');
    if (!tempPassword) {
      return;
    }

    this.svc.resetUserPassword(this.selectedUser.id, tempPassword).subscribe({
      next: () => {
        this.toast.show('success', 'Mot de passe réinitialisé avec succès');
        this.showReset = false;
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de la réinitialisation';
        this.toast.show('error', msg);
      }
    });
  }

  // ─────────────────────────────────────────────
  // ROLE ASSIGNMENT (Multi-rôles additifs)
  // ─────────────────────────────────────────────

  /**
   * Assigne un rôle à un utilisateur
   * PATCH /admin/users/{id}/roles/assign → { roleName }
   * Note: Les rôles sont additifs (un user peut avoir plusieurs rôles)
   */
  confirmRole(): void {
    if (!this.selectedUser?.id || !this.newRole) {
      return;
    }

    this.svc.assignRole(this.selectedUser.id, this.newRole).subscribe({
      next: () => {
        this.toast.show('success', `Rôle ${this.newRole} assigné avec succès`);
        this.showRole = false;
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de l\'assignation du rôle';
        this.toast.show('error', msg);
      }
    });
  }

  /**
   * Retire un rôle à un utilisateur
   * PATCH /admin/users/{id}/roles/remove → { roleName }
   */
  confirmRemoveRole(): void {
    if (!this.selectedUser?.id || !this.roleToRemove) {
      return;
    }

    this.svc.removeRole(this.selectedUser.id, this.roleToRemove).subscribe({
      next: () => {
        this.toast.show('info', `Rôle ${this.roleToRemove} retiré avec succès`);
        this.showRemoveRole = false;
        this.load();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de la suppression du rôle';
        this.toast.show('error', msg);
      }
    });
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  /**
   * Retourne les noms des rôles d'un utilisateur (séparés par virgule)
   */
  getRoleName(user: User): string {
    if (!user.roles || user.roles.length === 0) {
      return 'N/A';
    }
    return user.roles.map(r => r.name).join(', ');
  }
}

