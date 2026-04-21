import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurationService, Subscriber, CurationStreamEvent } from './services/curation.service';

interface LogLine {
  time: string;
  level: 'info' | 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './settings.component.html',
  styles: [`
    .page-container {
      padding: 24px 32px;
      max-width: 820px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .page-header {
      margin-bottom: 4px;
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
    .setting-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .setting-label { font-size: 0.88rem; font-weight: 500; color: var(--ws-text); }
    .setting-desc { font-size: 0.75rem; color: var(--ws-text-muted); }

    /* Subscribers list */
    .add-sub {
      display: flex;
      gap: 10px;
      padding: 12px 20px 4px;
      align-items: flex-start;
    }
    .add-sub mat-form-field { flex: 1; }
    .add-sub ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }

    .sub-list { padding: 0 20px 16px; display: flex; flex-direction: column; gap: 8px; }
    .sub-chip {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px;
      background: var(--ws-surface-alt, rgba(98,0,234,0.04));
      border: 1px solid var(--ws-border);
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .sub-chip mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: var(--ws-primary); }
    .sub-chip-email { flex: 1; color: var(--ws-text); }
    .sub-chip-date { font-size: 0.72rem; color: var(--ws-text-muted); }
    .sub-chip-delete {
      width: 28px; height: 28px; padding: 0;
      line-height: 28px;
      margin-left: 4px;
      color: var(--ws-text-muted);
      transition: color 120ms ease;
    }
    .sub-chip-delete:hover:not([disabled]) { color: #ef4444; }
    .sub-chip-delete mat-icon {
      font-size: 1rem; width: 1rem; height: 1rem;
      color: inherit;
    }

    /* Test curation */
    .test-area {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .test-btn-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .log-panel {
      background: #0d0d15;
      color: #e0e0e8;
      border-radius: 8px;
      padding: 12px 16px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.78rem;
      line-height: 1.6;
      height: 260px;
      overflow-y: auto;
      border: 1px solid #2a2a3e;
    }
    .log-line { display: flex; gap: 8px; }
    .log-time { color: #6b7280; flex-shrink: 0; }
    .log-level-info { color: #60a5fa; }
    .log-level-success { color: #34d399; }
    .log-level-error { color: #f87171; }
    .log-empty {
      color: #6b7280;
      font-style: italic;
      text-align: center;
      padding: 40px 0;
    }
  `],
})
export class SettingsComponent implements OnInit {
  protected readonly themeService = inject(ThemeService);
  private readonly curationService = inject(CurationService);
  private readonly notify = inject(NotificationService);

  readonly subscribers = signal<Subscriber[]>([]);
  readonly newEmail = signal('');
  readonly addingSub = signal(false);
  readonly deletingId = signal<string | null>(null);

  readonly isTestRunning = signal(false);
  readonly logs = signal<LogLine[]>([]);

  ngOnInit(): void {
    this.loadSubscribers();
  }

  private loadSubscribers(): void {
    this.curationService.listSubscribers().subscribe({
      next: (subs) => this.subscribers.set(subs),
      error: () => this.notify.error('No se pudieron cargar los suscriptores'),
    });
  }

  addSubscriber(): void {
    const email = this.newEmail().trim();
    if (!email || this.addingSub()) return;

    this.addingSub.set(true);
    this.curationService.addSubscriber(email).subscribe({
      next: (sub) => {
        this.subscribers.update(list => [...list, sub]);
        this.newEmail.set('');
        this.notify.success('Suscriptor agregado');
      },
      error: (err) => {
        this.notify.error(err?.error?.detail ?? 'Error al agregar suscriptor');
      },
      complete: () => this.addingSub.set(false),
    });
  }

  deleteSubscriber(sub: Subscriber): void {
    if (this.deletingId()) return;
    const ok = confirm(
      `¿Eliminar a ${sub.email}?\nDejará de recibir la curación cada 15 días.`,
    );
    if (!ok) return;

    this.deletingId.set(sub.id);
    this.curationService.deleteSubscriber(sub.id).subscribe({
      next: () => {
        this.subscribers.update(list => list.filter(s => s.id !== sub.id));
        this.notify.success('Suscriptor eliminado');
      },
      error: (err) => {
        this.notify.error(err?.error?.detail ?? 'Error al eliminar suscriptor');
      },
      complete: () => this.deletingId.set(null),
    });
  }

  runTest(): void {
    if (this.isTestRunning()) return;

    this.isTestRunning.set(true);
    this.logs.set([]);
    this.pushLog('info', 'Iniciando flujo de curación de prueba...');

    const { events$ } = this.curationService.runStream();
    events$.subscribe({
      next: (evt: CurationStreamEvent) => this.handleEvent(evt),
      error: (err: Error) => {
        this.pushLog('error', `Error: ${err.message}`);
        this.isTestRunning.set(false);
        this.notify.error('Error al ejecutar la curación');
      },
      complete: () => {
        this.isTestRunning.set(false);
      },
    });
  }

  private handleEvent(evt: CurationStreamEvent): void {
    switch (evt.type) {
      case 'progress':
        this.pushLog('info', `[${evt.step ?? '...'}] ${evt.message ?? ''}`);
        break;
      case 'result':
        this.pushLog('success', evt.message ?? 'Curación completada');
        this.notify.success('Curación completada');
        break;
      case 'error':
        this.pushLog('error', evt.message ?? 'Error desconocido');
        this.notify.error(evt.message ?? 'Error en la curación');
        break;
      case 'done':
        this.pushLog('info', '--- Fin del flujo ---');
        break;
    }
  }

  private pushLog(level: LogLine['level'], message: string): void {
    const time = new Date().toLocaleTimeString('es-CO', { hour12: false });
    this.logs.update(l => [...l, { time, level, message }]);
  }

  trackBySubId = (_i: number, s: Subscriber): string => s.id;
  trackByLogIdx = (i: number): number => i;
}
