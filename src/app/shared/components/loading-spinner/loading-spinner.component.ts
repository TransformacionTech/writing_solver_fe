import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/interceptors/loading.interceptor';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: var(--ws-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
  `],
})
export class LoadingSpinnerComponent {
  protected readonly loadingService = inject(LoadingService);
}
