import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styles: [`
    :host { display: block; height: 100vh; }
  `],
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.authService.restoreSession();
  }
}
