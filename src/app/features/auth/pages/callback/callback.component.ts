import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule],
  templateUrl: './callback.component.html',
  styles: [`
    .callback-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #1a1a2e;
    }
    .callback-content {
      display: flex; flex-direction: column; align-items: center; gap: 20px;
      color: white; text-align: center;
    }
    .callback-message { font-size: 0.9rem; color: rgba(255,255,255,0.6); }
    .callback-error {
      color: #ef5350; font-size: 0.9rem;
      max-width: 400px; line-height: 1.5;
    }
  `],
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!code) {
      this.isLoading = false;
      this.errorMessage = 'No se recibio el codigo de autorizacion de GitHub';
      return;
    }

    this.authService.handleGithubCallback(code).subscribe({
      next: () => {
        this.router.navigate(['/new-post']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail ?? 'Error al autenticar con GitHub';
      },
    });
  }
}
