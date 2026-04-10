import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, TOKEN_KEY } from '../../../core/services/auth.service';
import { UserHelper } from '../../../shared/helpers/user';
import { LocalStorage } from '../../../shared/helpers/localStorage';
import { LoginReturnType } from '../../../core/models/auth/login.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  features = [
    'Gestion complète des utilisateurs',
    'Bureau des validations organizer',
    'Gestion des profils utilisateurs',
    'Sécurité JWT + rôles ADMIN',
  ];

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  loading  = false;
  showPass = false;
  errorMsg = '';

  get f() { return this.form.controls; }

  loginWithGoogle(): void {
    this.auth.startGoogleAuth().subscribe({
      next: (res) => {
        const authUrl = (res?.data as any)?.authUrl;
        if (authUrl) {
          window.location.href = authUrl;
          return;
        }
        window.location.href = `${environment.apiUrl}/auth/google`;
      },
      error: () => {
        window.location.href = `${environment.apiUrl}/auth/google`;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = '';
    (this.auth.login(this.form.value) as any).subscribe({
      next: (res: LoginReturnType) => {
        if (res?.status === 200) {
          // FIX #2 : clé unifiée TOKEN_KEY au lieu de 'jbis_space_token'
          LocalStorage.setItem(TOKEN_KEY, res.data.access_token);
          UserHelper.saveUser(res.data.user, res.data.access_token);
          this.auth.loadUser().subscribe(() => {
            this.router.navigate(['/dashboard']);
          });
        }
      },
      error: () => { this.errorMsg = 'Identifiants incorrects.'; this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
}
