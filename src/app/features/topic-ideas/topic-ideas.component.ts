import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { WritingSolverService } from '../writing-solver/services/writing-solver.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-topic-ideas',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './topic-ideas.component.html',
  styles: [`
    :host { display: block; height: 100%; overflow: auto; }

    .page-container { padding: 24px 32px; max-width: 900px; margin: 0 auto; }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 1.6rem; font-weight: 600; color: var(--ws-text); }
    }
    .page-subtitle { font-size: 0.85rem; color: var(--ws-text-muted); margin-top: 4px; }

    .btn-suggest {
      background: #6200EA !important;
      color: white !important;
      border-radius: 8px;
    }

    .ideas-card {
      padding: 24px;
      border-radius: 12px;
      min-height: 300px;
    }

    .ideas-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      color: var(--ws-text-hint);
      gap: 12px;
      text-align: center;
      mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; opacity: 0.3; }
      p { margin: 0; font-size: 0.88rem; max-width: 380px; line-height: 1.5; }
    }

    .ideas-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
      color: var(--ws-text-muted);
      span { font-size: 0.88rem; }
    }

    .ideas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .idea-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border: 1px solid var(--ws-border);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #6200EA;
        background: rgba(98, 0, 234, 0.04);
      }
    }
    .idea-number {
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(98, 0, 234, 0.1); color: #6200EA;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 600; flex-shrink: 0;
    }
    .idea-text { flex: 1; font-size: 0.9rem; color: var(--ws-text); }
    .idea-arrow { color: var(--ws-icon-muted); }
    .idea-item:hover .idea-arrow { color: #6200EA; }

    .ideas-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--ws-border);
      display: flex;
      justify-content: center;
    }
  `],
})
export class TopicIdeasComponent {
  private readonly solverService = inject(WritingSolverService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly topics = signal<string[]>([]);
  readonly isLoading = signal(false);

  suggest(): void {
    this.isLoading.set(true);
    this.topics.set([]);

    this.solverService.suggestTopics().subscribe({
      next: (res) => {
        this.topics.set(res.topics);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Error al sugerir temas');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  selectTopic(topic: string): void {
    this.router.navigate(['/new-post'], { queryParams: { topic } });
  }
}
