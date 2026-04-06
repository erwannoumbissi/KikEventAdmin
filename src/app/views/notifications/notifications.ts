import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { KikNotification } from '../../core/models/kikevent.models';
@Component({ selector: 'app-notifications', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './notifications.html', styleUrls: ['./notifications.scss'] })
export class NotificationsComponent implements OnInit {
  protected svc = inject(AdminService); protected toast = inject(ToastService);
  notifs: KikNotification[] = []; loading = false; sending = false; showForm = false;
  form = { titre: '', message: '', cible: 'ALL' as 'ALL'|'ORGANIZERS'|'PARTICIPANTS'|'SPECIFIC', scheduledAt: '' };
  cibles = [{v:'ALL',l:'Tous les utilisateurs'},{v:'ORGANIZERS',l:'Organisateurs'},{v:'PARTICIPANTS',l:'Participants'}];
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.svc.getNotifications().subscribe({
      next: r => { this.notifs = r.data?.content ?? r.data ?? this.mock(); },
      error: () => { this.notifs = this.mock(); this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
  send(): void {
    if (!this.form.titre.trim() || !this.form.message.trim()) { this.toast.show('warning', 'Titre et message requis.'); return; }
    this.sending = true;
    const payload: Partial<KikNotification> = { titre: this.form.titre, message: this.form.message, cible: this.form.cible, scheduledAt: this.form.scheduledAt || undefined, statut: this.form.scheduledAt ? 'SCHEDULED' : 'SENT' };
    this.svc.sendNotification(payload).subscribe({
      next: () => { this.toast.show('success', 'Notification envoyée !'); this.form = {titre:'',message:'',cible:'ALL',scheduledAt:''}; this.showForm = false; this.load(); },
      error: () => { this.toast.show('error', "Erreur envoi"); },
      complete: () => { this.sending = false; }
    });
  }
  cibleLabel(c: string): string { const m: Record<string,string> = {ALL:'Tous',ORGANIZERS:'Organisateurs',PARTICIPANTS:'Participants',SPECIFIC:'Ciblé'}; return m[c] ?? c; }
  private mock(): KikNotification[] {
    return [
      {id:1,titre:'Bienvenue sur KikEvent !',message:'Découvrez notre plateforme.',cible:'ALL',statut:'SENT',createdAt:'2025-04-01',sentAt:'2025-04-01'},
      {id:2,titre:'Mise à jour des CGU',message:'Nos conditions ont été mises à jour.',cible:'ALL',statut:'SENT',createdAt:'2025-04-02',sentAt:'2025-04-02'},
      {id:3,titre:'Vérifiez vos documents',message:'Certains organisateurs doivent re-soumettre.',cible:'ORGANIZERS',statut:'SCHEDULED',createdAt:'2025-04-04',scheduledAt:'2025-05-01'},
    ];
  }
}