import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-success',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './login-success.component.html',
  styles: [`
    .container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #1a1a2e;
    }
    .content {
      display: flex; flex-direction: column; align-items: center; gap: 20px;
      color: white; text-align: center;
    }
    .message { font-size: 0.9rem; color: rgba(255,255,255,0.6); }
    .error { color: #ef5350; font-size: 0.9rem; }
  `],
})
export class LoginSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  errorMessage = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMessage = 'No se recibio el token de autenticacion';
      return;
    }

    this.authService.saveToken(token);
    this.router.navigate(['/new-post']);
  }
}
