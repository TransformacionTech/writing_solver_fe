import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { WritingSolverService } from './services/writing-solver.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatMessage, PipelineEvent } from './models/writing-solver.model';

@Component({
  selector: 'app-writing-solver',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  templateUrl: './writing-solver.component.html',
  styles: [`
    :host { display: block; height: 100%; }

    .ws-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 100%;
    }

    .ws-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid var(--ws-border);
      background: var(--ws-surface);
      flex-shrink: 0;
      transition: background-color 0.3s, border-color 0.3s;

      h1 { margin: 0; font-size: 1.4rem; font-weight: 600; color: var(--ws-text); }
    }

    .ws-header-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws-subtitle {
      font-size: 0.8rem;
      color: var(--ws-text-muted);
    }

    .ws-header-actions {
      display: flex;
      gap: 8px;
    }

    .ws-chat {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ws-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      color: var(--ws-text-muted);
      gap: 8px;

      h3 { margin: 0; font-size: 1.2rem; color: var(--ws-text-secondary); }
      p { margin: 0; font-size: 0.88rem; max-width: 480px; line-height: 1.5; }
    }

    .ws-empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #6200EA;
      opacity: 0.5;
      margin-bottom: 8px;
    }

    .ws-examples {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .ws-examples-label {
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ws-text-hint);
    }

    .ws-example-chip {
      background: var(--ws-surface);
      border: 1px solid var(--ws-border-strong);
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.84rem;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--ws-text-secondary);
      max-width: 480px;

      &:hover {
        border-color: #6200EA;
        color: #6200EA;
        background: rgba(98,0,234,0.04);
      }
    }

    .ws-message {
      display: flex;
      gap: 12px;
      max-width: 85%;
      animation: fadeIn 0.3s ease;

      &--user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      &--assistant {
        align-self: flex-start;
      }
    }

    .ws-message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .ws-message--user & {
        background: #3f51b5;
        color: white;
      }
      .ws-message--assistant & {
        background: #6200EA;
        color: white;
      }

      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    }

    .ws-message-content {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.6;
      word-break: break-word;

      .ws-message--user & {
        background: #3f51b5;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .ws-message--assistant & {
        background: var(--ws-surface);
        color: var(--ws-text);
        border: 1px solid var(--ws-border);
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
    }

    .ws-input-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px 16px;
      background: var(--ws-surface);
      border-top: 1px solid var(--ws-border);
      transition: background-color 0.3s, border-color 0.3s;
      flex-shrink: 0;
    }

    .ws-input-field {
      flex: 1;

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class WritingSolverComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;

  private readonly solverService = inject(WritingSolverService);
  private readonly notificationService = inject(NotificationService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly inputText = signal('');
  readonly isProcessing = signal(false);

  private postState = '';
  private shouldScroll = false;

  readonly examples = [
    'Crea un post sobre modernizacion de sistemas legacy en aseguradoras',
    'Crea un post sobre DevOps para aseguradoras en LATAM',
    'Crea un post sobre seguros embebidos',
  ];

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  send(): void {
    const text = this.inputText().trim();
    if (!text || this.isProcessing()) return;

    this.inputText.set('');
    this.addMessage('user', text);

    const tema = this.detectTema(text);
    if (tema) {
      this.runPipeline(tema);
      return;
    }

    if (!this.postState) {
      this.addMessage(
        'assistant',
        'Aun no hay un post generado. Di **"Crea un post [tema]"** para que los agentes lo generen.',
      );
      return;
    }

    this.chatAboutPost(text);
  }

  sendExample(example: string): void {
    this.inputText.set(example);
    this.send();
  }

  private runPipeline(tema: string): void {
    this.isProcessing.set(true);
    this.addMessage('assistant', '**Iniciando pipeline...**\n\nLos agentes estan trabajando en tu post.');

    const { events$ } = this.solverService.runPipeline(tema);
    events$.subscribe({
      next: (event: PipelineEvent) => this.handlePipelineEvent(event),
      error: (err: Error) => {
        this.updateLastAssistantMessage(`**Error en el pipeline:**\n\n\`${err.message}\``);
        this.isProcessing.set(false);
        this.notificationService.error('Error en el pipeline');
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  private handlePipelineEvent(event: PipelineEvent): void {
    switch (event.type) {
      case 'progress':
        this.updateLastAssistantMessage(
          `**[${event.agent}]** ${event.message}`,
        );
        break;

      case 'result':
        this.postState = event.post ?? '';
        this.updateLastAssistantMessage(
          `### Post Generado (Score: ${event.score ?? '-'}/10)\n\n${event.post}\n\n` +
          `---\nAhora puedes pedirme ajustes sobre el post.`,
        );
        this.notificationService.success(`Post generado con score ${event.score ?? '-'}/10`);
        break;

      case 'done':
        break;
    }
  }

  private chatAboutPost(message: string): void {
    this.isProcessing.set(true);
    this.addMessage('assistant', '**Procesando tu peticion...**');

    this.solverService.chatAboutPost(message, this.postState, this.messages()).subscribe({
      next: (res) => {
        this.updateLastAssistantMessage(res.respuesta);
        if (res.post_modificado) {
          this.postState = res.respuesta;
        }
      },
      error: (err: Error) => {
        this.updateLastAssistantMessage(`**Error en el chat:**\n\n\`${err.message}\``);
        this.notificationService.error('Error al procesar mensaje');
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.update(msgs => [...msgs, { role, content, timestamp: new Date() }]);
    this.shouldScroll = true;
  }

  private updateLastAssistantMessage(content: string): void {
    this.messages.update(msgs => {
      const updated = [...msgs];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'assistant') {
          updated[i] = { ...updated[i], content };
          break;
        }
      }
      return updated;
    });
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    if (this.chatContainer) {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private detectTema(text: string): string | null {
    const match = text.match(/crea\s+un\s+post\s+(?:sobre\s+)?(.+)/i);
    return match ? match[1].trim() : null;
  }
}
