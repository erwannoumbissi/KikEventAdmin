import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/service/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [null as number | null, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  loading = false;
  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.register(this.form.value as any).subscribe({
      next: (res) => {
        this.toast.show('success', res?.message ?? 'Compte créé avec succès');
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.toast.show('error', e?.error?.message ?? 'Erreur lors de la création du compte');
      },
      complete: () => { this.loading = false; }
    });
  }
}
