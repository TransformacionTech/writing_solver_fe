import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
    .login-container {
      display: flex; align-items: center; justify-content: center;
      height: 100%;
      background: #1a1a2e;
    }
    .login-content {
      width: 440px; display: flex; flex-direction: column; align-items: center; gap: 24px;
    }
    .login-header {
      text-align: center; color: white;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      h2 { margin: 0; font-size: 1.4rem; font-weight: 700; }
      p { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin: 0; letter-spacing: 0.3px; }
    }
    .login-app-icon {
      width: 64px; height: 64px;
      border-radius: 16px;
      object-fit: contain;
    }
    .github-btn {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 32px; border-radius: 12px;
      background: white; color: #1a1a2e;
      font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      border: none; width: 100%;
      justify-content: center;

      &:hover {
        background: #f0f0f0;
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      }
    }
    .github-icon {
      font-size: 1.4rem; width: 1.4rem; height: 1.4rem;
    }
    .login-hint { font-size: 0.72rem; color: rgba(255,255,255,0.3); margin: 0; }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  loginWithGithub(): void {
    this.authService.loginWithGithub();
  }
}
