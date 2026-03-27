import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, MatCardModule],
  templateUrl: './dashboard.component.html',
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    }
    .subtitle { font-size: 0.85rem; color: rgba(0,0,0,0.5); }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .kpi-card {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      .kpi-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #3f51b5; }
      .kpi-info { display: flex; flex-direction: column; }
      .kpi-value { font-size: 1.5rem; font-weight: 700; }
      .kpi-label { font-size: 0.8rem; color: rgba(0,0,0,0.5); }
    }
  `],
})
export class DashboardComponent {}
