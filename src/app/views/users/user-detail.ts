import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user/User.model';
import { ToastService } from '../../shared/components/toast/service/toast.service';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(AdminService);
  private toast = inject(ToastService);

  loading = false;
  user: User | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { return; }
    this.loading = true;
    this.svc.getUserById(id).subscribe({
      next: (res) => { this.user = res.data; },
      error: () => this.toast.show('error', 'Utilisateur introuvable'),
      complete: () => { this.loading = false; }
    });
  }

  roleNames(): string {
    return (this.user?.roles ?? []).map(r => r.name).join(', ') || 'Aucun';
  }

  permissionNames(): string {
    return (this.user?.permissions ?? []).map(p => p.name).join(', ') || 'Aucune';
  }
}
