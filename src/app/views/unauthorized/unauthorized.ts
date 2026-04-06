import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="unauthorized-page">
      <div class="unauthorized-card">
        <h1>Accès refusé</h1>
        <p>Vous n'êtes pas autorisé(e) à accéder à cette page.</p>
        <p>Veuillez vous reconnecter avec un compte disposant des droits requis.</p>
        <a routerLink="/login" class="unauthorized-link">Retour à la connexion</a>
      </div>
    </div>
  `,
  styles: [
    `.unauthorized-page { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#F5F5F7; padding:24px; }
     .unauthorized-card { max-width:420px; width:100%; text-align:center; padding:36px; border-radius:20px; background:#fff; box-shadow:0 20px 60px rgba(0,0,0,.08); }
     .unauthorized-card h1 { font-size:28px; margin-bottom:16px; color:#1F2937; }
     .unauthorized-card p { color:#4B5563; line-height:1.6; margin:0 0 12px; }
     .unauthorized-link { display:inline-block; margin-top:20px; padding:12px 22px; background:#5B4CF5; color:#fff; text-decoration:none; border-radius:12px; font-weight:600; }
     .unauthorized-link:hover { background:#4335B5; }
    `
  ]
})
export class UnauthorizedComponent {}
