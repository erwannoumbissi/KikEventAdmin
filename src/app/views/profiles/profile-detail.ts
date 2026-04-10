import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { UserProfile } from '../../core/models/user/User.model';
import { ToastService } from '../../shared/components/toast/service/toast.service';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-detail.html',
  styleUrls: ['./profile-detail.scss']
})
export class ProfileDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(AdminService);
  private toast = inject(ToastService);

  loading = false;
  profile: UserProfile | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { return; }
    this.loading = true;
    this.svc.getProfileById(id).subscribe({
      next: (res) => { this.profile = res.data; },
      error: () => this.toast.show('error', 'Profil introuvable'),
      complete: () => { this.loading = false; }
    });
  }
}
