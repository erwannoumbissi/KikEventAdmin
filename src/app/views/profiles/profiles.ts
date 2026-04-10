import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { UserProfile, UpdateProfileRequest } from '../../core/models/user/User.model';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { extractContent, extractTotal } from '../../shared/helpers/api.helper';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profiles.html',
  styleUrls: ['./profiles.scss']
})
export class ProfilesComponent implements OnInit {
  private svc = inject(AdminService);
  private toast = inject(ToastService);

  profiles: UserProfile[] = [];
  loading = false;
  total = 0;

  showEdit = false;
  selected: UserProfile | null = null;
  form: UpdateProfileRequest = { firstName: '', lastName: '', avatarUrl: '', bio: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.getProfiles().subscribe({
      next: (res) => {
        this.profiles = extractContent<UserProfile>(res.data as any);
        this.total = extractTotal<UserProfile>(res.data as any);
      },
      error: () => this.toast.show('error', 'Erreur chargement profils'),
      complete: () => { this.loading = false; }
    });
  }

  openEdit(p: UserProfile): void {
    this.selected = p;
    this.form = {
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      avatarUrl: p.avatarUrl ?? '',
      bio: p.bio ?? ''
    };
    this.showEdit = true;
  }

  close(): void {
    this.showEdit = false;
    this.selected = null;
  }

  save(): void {
    if (!this.selected?.userId) { return; }
    this.svc.updateProfile(this.selected.userId, this.form).subscribe({
      next: (res) => {
        this.toast.show('success', res?.message ?? 'Profil mis à jour');
        this.close();
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error?.message ?? 'Erreur mise à jour')
    });
  }

  remove(p: UserProfile): void {
    if (!p.userId) { return; }
    this.svc.deleteProfile(p.userId).subscribe({
      next: (res) => {
        this.toast.show('info', res?.message ?? 'Profil supprimé');
        this.load();
      },
      error: (e) => this.toast.show('error', e?.error?.message ?? 'Erreur suppression')
    });
  }
}
