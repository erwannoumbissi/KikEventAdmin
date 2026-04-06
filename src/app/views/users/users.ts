import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';

@Component({ selector: 'app-users', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './users.html', styleUrls: ['./users.scss'] })
export class UsersComponent implements OnInit {
  protected svc   = inject(AdminService);
  protected toast = inject(ToastService);

  users: any[] = [];
  loading = false; page = 0; size = 10; total = 0;
  searchTerm = ''; selectedRole = '';
  showSuspend = false; showReset = false; showRole = false;
  selectedUser: any = null; suspendMotif = ''; newRole = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getUsers(this.page, this.size, this.searchTerm, this.selectedRole).subscribe({
      next: r => { this.users = r.data?.content ?? r.data ?? this.mock(); this.total = r.data?.totalElements ?? this.users.length; },
      error: () => { this.users = this.mock(); this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  openSuspend(u: any): void { this.selectedUser = u; this.suspendMotif = ''; this.showSuspend = true; }
  openReset(u: any): void   { this.selectedUser = u; this.showReset = true; }
  openRole(u: any): void    { this.selectedUser = u; this.newRole = u.roles?.[0]?.name ?? ''; this.showRole = true; }

  confirmSuspend(): void {
    if (!this.selectedUser || !this.suspendMotif.trim()) { return; }
    this.svc.suspendUser(this.selectedUser.id, this.suspendMotif).subscribe({
      next: () => { this.toast.show('success', 'Compte suspendu'); this.showSuspend = false; this.load(); },
      error: () => { this.toast.show('error', 'Erreur suspension'); }
    });
  }
  confirmActivate(u: any): void {
    this.svc.activateUser(u.id).subscribe({
      next: () => { this.toast.show('success', 'Compte réactivé'); this.load(); },
      error: () => { this.toast.show('error', 'Erreur réactivation'); }
    });
  }
  confirmReset(): void {
    if (!this.selectedUser) { return; }
    this.svc.resetUserPassword(this.selectedUser.id).subscribe({
      next: () => { this.toast.show('success', 'Email de réinitialisation envoyé'); this.showReset = false; },
      error: () => { this.toast.show('error', 'Erreur reset'); }
    });
  }
  confirmRole(): void {
    if (!this.selectedUser || !this.newRole) { return; }
    this.svc.assignRole(this.selectedUser.id, this.newRole).subscribe({
      next: () => { this.toast.show('success', 'Rôle mis à jour'); this.showRole = false; this.load(); },
      error: () => { this.toast.show('error', 'Erreur rôle'); }
    });
  }
  getRoleName(u: any): string { return u.roles?.[0]?.name ?? 'N/A'; }
  private mock(): any[] {
    return [
      {id:1,username:'Jean Kamga',  email:'jean@cm',  enabled:true,  createdAt:'2025-01-10',roles:[{id:2,name:'ORGANIZER'}]},
      {id:2,username:'Marie Ngok',  email:'marie@cm', enabled:true,  createdAt:'2025-01-14',roles:[{id:4,name:'PARTICIPANT'}]},
      {id:3,username:'Paul Admin',  email:'paul@cm',  enabled:true,  createdAt:'2025-01-01',roles:[{id:1,name:'ADMIN'}]},
      {id:4,username:'Alice Ctrl',  email:'alice@cm', enabled:false, createdAt:'2025-02-01',roles:[{id:3,name:'CONTROLER'}]},
    ];
  }

}
