import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { OrganizerRequest } from '../../core/models/organizer/organizer.model';
import { ToastService } from '../../shared/components/toast/service/toast.service';

@Component({
  selector: 'app-organizer-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './organizer-request-detail.html',
  styleUrls: ['./organizer-request-detail.scss']
})
export class OrganizerRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(AdminService);
  private toast = inject(ToastService);

  loading = false;
  request: OrganizerRequest | null = null;

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (!userId) { return; }
    this.loading = true;
    this.svc.getOrganizerRequestByUser(userId).subscribe({
      next: (res) => { this.request = res.data; },
      error: () => this.toast.show('error', 'Demande introuvable'),
      complete: () => { this.loading = false; }
    });
  }
}
