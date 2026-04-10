import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  private toast = inject(ToastService);

  profile = {
    nom: 'Admin KikEvent',
    email: 'admin@kikevent.cm',
    password: '',
    confirmPassword: ''
  };

  system = {
    apiUrl: environment.apiUrl,
    platformName: environment.appName,
    supportEmail: 'support@kikevent.cm',
    devise: 'FCFA (XAF)',
    mockMode: true
  };

  ngOnInit(): void {}

  saveProfile(): void {
    if (this.profile.password && this.profile.password !== this.profile.confirmPassword) {
      this.toast.show('warning', 'Les mots de passe ne correspondent pas.');
      return;
    }
    this.toast.show('success', 'Profil mis à jour avec succès.');
    this.profile.password = '';
    this.profile.confirmPassword = '';
  }

  saveSystem(): void {
    this.toast.show('success', 'Configuration système sauvegardée.');
  }
}
