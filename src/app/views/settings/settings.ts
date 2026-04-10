import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ChangePasswordRequest, UpdateProfileRequest } from '../../core/models/admin/admin-dto.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);

  // Profil admin
  adminId       : number | null = null;
  adminUsername = '';
  adminEmail    = '';
  adminRoles    : string[] = [];
  loadingMe     = false;
  loadingProfile = false;
  savingProfile = false;
  profileEndpointUnavailable = false;

  profile = {
    firstName: '',
    lastName: '',
    avatarUrl: '',
    bio: ''
  };

  // Formulaire PATCH /me/password
  pwd = { currentPassword: '', newPassword: '', confirm: '' };
  savingPwd = false;

  // Infos système (lecture seule)
  system = {
    apiUrl:     environment.apiUrl,
    appName:    environment.appName,
    version:    environment.version,
    production: environment.production
  };

  ngOnInit(): void {
    this.loadMe();
    this.loadMyProfile();
  }

  /**
   * GET /me — charge les infos de l'utilisateur connecté
   */
  private loadMe(): void {
    this.loadingMe = true;
    this.auth.getMyInfo().subscribe({
      next: res => {
        const d = res?.data as any;
        if (d) {
          this.adminId       = d.id       ?? null;
          this.adminUsername = d.username ?? d.name ?? '';
          this.adminEmail    = d.email    ?? '';
          this.adminRoles    = (d.roles ?? []).map((r: any) =>
            typeof r === 'string' ? r : (r?.name ?? '')
          ).filter(Boolean);
        }
      },
      error: () => { this.loadingMe = false; },
      complete: () => { this.loadingMe = false; }
    });
  }

  private loadMyProfile(): void {
    this.loadingProfile = true;
    this.auth.getMyProfile().subscribe({
      next: (res) => {
        this.profileEndpointUnavailable = (res?.message ?? '').toLowerCase().includes('non disponible');
        const p = res?.data as any;
        this.profile = {
          firstName: p?.firstName ?? '',
          lastName: p?.lastName ?? '',
          avatarUrl: p?.avatarUrl ?? '',
          bio: p?.bio ?? ''
        };
      },
      error: () => { this.loadingProfile = false; },
      complete: () => { this.loadingProfile = false; }
    });
  }

  saveMyProfile(): void {
    this.savingProfile = true;
    const body: UpdateProfileRequest = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      avatarUrl: this.profile.avatarUrl || undefined,
      bio: this.profile.bio || undefined
    };

    this.auth.updateMyProfile(body).subscribe({
      next: (res) => {
        if ((res?.status ?? 0) >= 200 && (res?.status ?? 0) < 300) {
          this.toast.show('success', res?.message ?? 'Profil mis à jour');
          return;
        }
        this.toast.show('warning', res?.message ?? 'Mise à jour non appliquée par le backend');
      },
      error: (e) => this.toast.show('error', e.error?.message ?? 'Erreur mise à jour profil'),
      complete: () => { this.savingProfile = false; }
    });
  }

  /**
   * PATCH /me/password — { currentPassword, newPassword }
   * Validation: newPassword min 8 caractères (contrainte Swagger)
   */
  changePassword(): void {
    if (!this.pwd.currentPassword || !this.pwd.newPassword) {
      this.toast.show('warning', 'Tous les champs sont requis'); return;
    }
    if (this.pwd.newPassword.length < 8) {
      this.toast.show('warning', 'Nouveau mot de passe : minimum 8 caractères'); return;
    }
    if (this.pwd.newPassword !== this.pwd.confirm) {
      this.toast.show('warning', 'Les mots de passe ne correspondent pas'); return;
    }

    this.savingPwd = true;
    const body: ChangePasswordRequest = {
      currentPassword: this.pwd.currentPassword,
      newPassword:     this.pwd.newPassword
    };

    this.auth.changePassword(body).subscribe({
      next: res => {
        this.toast.show('success', res?.message ?? 'Mot de passe modifié avec succès');
        this.pwd = { currentPassword: '', newPassword: '', confirm: '' };
      },
      error: e => {
        this.toast.show('error', e.error?.message ?? 'Erreur lors du changement de mot de passe');
      },
      complete: () => { this.savingPwd = false; }
    });
  }

  initials(): string {
    return (this.adminUsername || 'AD').substring(0, 2).toUpperCase();
  }

  get roleDisplay(): string {
    return this.adminRoles.length > 0 ? this.adminRoles[0] : 'N/A';
  }
}
