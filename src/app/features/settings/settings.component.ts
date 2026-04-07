import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, MatSlideToggleModule],
  templateUrl: './settings.component.html',
  styles: [`
    .page-container {
      padding: 24px 32px;
      max-width: 700px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 1.4rem; font-weight: 600; color: var(--ws-text); }
    }
    .subtitle { font-size: 0.85rem; color: var(--ws-text-muted); }

    .settings-section {
      background: var(--ws-surface);
      border: 1px solid var(--ws-border);
      border-radius: 12px;
      overflow: hidden;
    }
    .section-title {
      padding: 16px 20px 8px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ws-text-muted);
    }
    .setting-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--ws-border);
      &:last-child { border-bottom: none; }
    }
    .setting-icon {
      width: 36px; height: 36px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: var(--ws-primary-bg);
      color: var(--ws-primary);
      flex-shrink: 0;
      mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    }
    .setting-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .setting-label {
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--ws-text);
    }
    .setting-desc {
      font-size: 0.75rem;
      color: var(--ws-text-muted);
    }
  `],
})
export class SettingsComponent {
  protected readonly themeService = inject(ThemeService);
}
