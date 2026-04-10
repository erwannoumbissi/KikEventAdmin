import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { User } from '../../core/models/user/User.model';
import { extractContent, extractTotal } from '../../shared/helpers/api.helper';

const ROLES = ['ADMIN', 'ORGANIZER', 'CONTROLER', 'PARTICIPANT'] as const;
type RoleName = typeof ROLES[number];

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  private svc   = inject(AdminService);
  private toast = inject(ToastService);

  readonly ROLES = ROLES;

  users  : User[] = [];
  loading = false;
  page = 0; size = 10; total = 0;

  // Modales
  showSuspend    = false;
  showActivate   = false;
  showReset      = false;
  showAssignRole = false;
  showRemoveRole = false;
  showDetail     = false;

  selectedUser    : User | null = null;
  suspendMotif    = '';
  newPassword     = '';
  confirmPassword = '';
  roleToAssign    = '';
  roleToRemove    = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getUsers().subscribe({
      next: r => {
        this.users = extractContent<User>(r.data as any);
        this.total = extractTotal<User>(r.data as any);
      },
      error: () => {
        this.toast.show('error', 'Erreur chargement utilisateurs');
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }

  // ── Ouvrir modales ──────────────────────────────────────────────────

  openDetail(u: User)     : void { this.selectedUser = u; this.showDetail     = true; }
  openSuspend(u: User)    : void { this.selectedUser = u; this.suspendMotif = ''; this.showSuspend    = true; }
  openActivate(u: User)   : void { this.selectedUser = u; this.showActivate   = true; }
  openReset(u: User)      : void { this.selectedUser = u; this.newPassword = ''; this.confirmPassword = ''; this.showReset = true; }
  openAssignRole(u: User) : void { this.selectedUser = u; this.roleToAssign = ''; this.showAssignRole = true; }
  openRemoveRole(u: User) : void {
    this.selectedUser = u;
    this.roleToRemove = u.roles?.[0]?.name ?? '';
    this.showRemoveRole = true;
  }

  close(): void {
    this.showSuspend = this.showActivate = this.showReset =
    this.showAssignRole = this.showRemoveRole = this.showDetail = false;
    this.selectedUser = null;
  }

  // ── Actions API ─────────────────────────────────────────────────────

  /** PATCH /admin/users/{id}/status  { enabled: false } */
  confirmSuspend(): void {
    if (!this.selectedUser?.id || !this.suspendMotif.trim()) { return; }
    this.svc.updateUserStatus(this.selectedUser.id, false).subscribe({
      next: () => { this.toast.show('success', 'Compte suspendu'); this.close(); this.load(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur suspension'); }
    });
  }

  /** PATCH /admin/users/{id}/status  { enabled: true } */
  confirmActivate(): void {
    if (!this.selectedUser?.id) { return; }
    this.svc.updateUserStatus(this.selectedUser.id, true).subscribe({
      next: () => { this.toast.show('success', 'Compte réactivé'); this.close(); this.load(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur réactivation'); }
    });
  }

  /** PATCH /admin/users/{id}/password  { newPassword } */
  confirmReset(): void {
    if (!this.selectedUser?.id) { return; }
    if (this.newPassword.length < 8) {
      this.toast.show('warning', 'Minimum 8 caractères requis'); return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toast.show('warning', 'Les mots de passe ne correspondent pas'); return;
    }
    this.svc.resetUserPassword(this.selectedUser.id, this.newPassword).subscribe({
      next: () => { this.toast.show('success', 'Mot de passe réinitialisé'); this.close(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur reset'); }
    });
  }

  /** PATCH /admin/users/{id}/roles/assign  { roleName } */
  confirmAssignRole(): void {
    if (!this.selectedUser?.id || !this.roleToAssign) { return; }
    this.svc.assignRole(this.selectedUser.id, this.roleToAssign).subscribe({
      next: () => { this.toast.show('success', `Rôle ${this.roleToAssign} assigné`); this.close(); this.load(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur assignation'); }
    });
  }

  /** PATCH /admin/users/{id}/roles/remove  { roleName } */
  confirmRemoveRole(): void {
    if (!this.selectedUser?.id || !this.roleToRemove) { return; }
    this.svc.removeRole(this.selectedUser.id, this.roleToRemove).subscribe({
      next: () => { this.toast.show('info', `Rôle ${this.roleToRemove} retiré`); this.close(); this.load(); },
      error: (e) => { this.toast.show('error', e.error?.message ?? 'Erreur suppression rôle'); }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  roleNames(u: User): string {
    return (u.roles ?? []).map(r => r.name).join(', ') || 'Aucun';
  }

  initials(name: string): string {
    return (name || '?').substring(0, 2).toUpperCase();
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.size)); }
}
