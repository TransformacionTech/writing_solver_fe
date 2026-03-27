import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './settings.component.html',
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    }
    .subtitle { font-size: 0.85rem; color: rgba(0,0,0,0.5); }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 64px; color: rgba(0,0,0,0.4);
      mat-icon { font-size: 4rem; width: 4rem; height: 4rem; opacity: 0.3; }
      p { font-size: 0.9rem; }
    }
  `],
})
export class SettingsComponent {}
