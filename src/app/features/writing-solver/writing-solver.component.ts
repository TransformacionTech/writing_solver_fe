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
import {
  ChatMessage,
  PipelineEvent,
  Fase2Data,
  PipelineCompletoData,
  PipelineErrorData,
} from './models/writing-solver.model';

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
      border-bottom: 1px solid rgba(0,0,0,0.08);
      background: white;
      flex-shrink: 0;

      h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    }

    .ws-header-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws-subtitle {
      font-size: 0.8rem;
      color: rgba(0,0,0,0.5);
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
      color: rgba(0,0,0,0.5);
      gap: 8px;

      h3 { margin: 0; font-size: 1.2rem; color: rgba(0,0,0,0.7); }
      p { margin: 0; font-size: 0.88rem; max-width: 480px; line-height: 1.5; }
    }

    .ws-empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #da6ccf;
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
      color: rgba(0,0,0,0.4);
    }

    .ws-example-chip {
      background: white;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.84rem;
      cursor: pointer;
      transition: all 0.2s;
      color: rgba(0,0,0,0.7);
      max-width: 480px;

      &:hover {
        border-color: #da6ccf;
        color: #da6ccf;
        background: rgba(218,108,207,0.04);
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
        background: #da6ccf;
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
        background: white;
        color: #1a1a2e;
        border: 1px solid rgba(0,0,0,0.08);
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
    }

    .ws-input-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px 16px;
      background: white;
      border-top: 1px solid rgba(0,0,0,0.08);
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

    if (this.detectTopicSuggestion(text)) {
      this.suggestTopics();
      return;
    }

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

  suggestTopics(): void {
    this.isProcessing.set(true);
    this.addMessage('assistant', '**Buscando temas trending...**\n\n_El TopicSuggester analiza el mercado asegurador en LATAM._');

    this.solverService.suggestTopics().subscribe({
      next: (event) => this.handleTopicEvent(event),
      error: (err) => {
        this.updateLastAssistantMessage(`**Error al sugerir temas:**\n\n\`${err.message}\``);
        this.isProcessing.set(false);
        this.notificationService.error('Error al sugerir temas');
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  updateRag(): void {
    this.isProcessing.set(true);
    this.addMessage('user', 'Actualizar base RAG');
    this.addMessage('assistant', '**Actualizando base de datos RAG...**');

    this.solverService.updateRag().subscribe({
      next: (res) => {
        if (res.success) {
          this.updateLastAssistantMessage(
            `**Base RAG actualizada.**\n\n\`\`\`\n${res.output}\n\`\`\`\n\nLos agentes ya pueden consultar los posts indexados.`,
          );
          this.notificationService.success('Base RAG actualizada');
        } else {
          this.updateLastAssistantMessage(
            `**Error al actualizar la base RAG:**\n\n\`\`\`\n${res.output}\n\`\`\``,
          );
          this.notificationService.error('Error al actualizar RAG');
        }
      },
      error: (err) => {
        this.updateLastAssistantMessage(`**Error inesperado:**\n\n\`${err.message}\``);
        this.notificationService.error('Error al actualizar RAG');
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  private runPipeline(tema: string): void {
    this.isProcessing.set(true);
    this.addMessage(
      'assistant',
      '**Fase 1/2 -- Investigacion**\n\n' +
      'El **Researcher** busca datos actuales en la web sobre el tema.\n' +
      'Luego el **Writer** redacta el post con esa informacion.\n\n' +
      '_Esto puede tardar 30-90 segundos._',
    );

    this.solverService.runPipeline(tema).subscribe({
      next: (event) => this.handlePipelineEvent(event),
      error: (err) => {
        this.updateLastAssistantMessage(`**Error en el pipeline:**\n\n\`${err.message}\``);
        this.isProcessing.set(false);
        this.notificationService.error('Error en el pipeline');
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  private handlePipelineEvent(event: PipelineEvent): void {
    switch (event.type) {
      case 'FASE1_INICIO':
        this.updateLastAssistantMessage(
          '**Fase 1/2 -- Investigacion**\n\n' +
          'El **Researcher** busca datos actuales en la web sobre el tema.\n' +
          'Luego el **Writer** redacta el post con esa informacion.\n\n' +
          '_Esto puede tardar 30-90 segundos._',
        );
        break;

      case 'FASE2_INTENTO': {
        const d = event.data as unknown as Fase2Data;
        this.updateLastAssistantMessage(
          `Fase 1 completa. Investigacion + post inicial listos.\n\n` +
          `**Fase 2/2 -- Edicion y Evaluacion (intento ${d.intento}/${d.max})**\n\n` +
          `El **Editor** mejora el borrador y el **Reader** evalua ` +
          `si suena como un post real de Tech And Solve (score >= 8/10 para aprobar).\n\n` +
          `_Esto puede tardar 20-40 segundos por intento._`,
        );
        break;
      }

      case 'PIPELINE_COMPLETO': {
        const d = event.data as unknown as PipelineCompletoData;
        this.postState = d.post;
        const proceso = d.log.join('\n');
        this.updateLastAssistantMessage(
          `### Proceso completado\n\n${proceso}\n\n` +
          `---\n\n### Post Final Aprobado\n\n${d.post}\n\n` +
          `---\nAhora puedes pedirme ajustes sobre el post, o hacer preguntas sobre el.`,
        );
        this.notificationService.success('Post generado exitosamente');
        break;
      }

      case 'PIPELINE_ERROR': {
        const d = event.data as unknown as PipelineErrorData;
        this.updateLastAssistantMessage(`**Error en Fase ${d.fase}:**\n\n\`${d.error}\``);
        this.notificationService.error(`Error en fase ${d.fase}`);
        break;
      }
    }
  }

  private handleTopicEvent(event: PipelineEvent): void {
    if (event.type === 'PIPELINE_COMPLETO') {
      const ideas = (event.data as Record<string, string>)['ideas'] ?? '';
      this.updateLastAssistantMessage(
        `### Ideas de Posts para Marketing\n\n${ideas}\n\n` +
        `---\nDi **"Crea un post [tema]"** para generar cualquiera de estas ideas.`,
      );
    } else if (event.type === 'PIPELINE_ERROR') {
      const d = event.data as unknown as PipelineErrorData;
      this.updateLastAssistantMessage(`**Error al sugerir temas:**\n\n\`${d.error}\``);
    }
  }

  private chatAboutPost(mensaje: string): void {
    this.isProcessing.set(true);
    this.addMessage('assistant', '**Procesando tu peticion...**');

    this.solverService.chatAboutPost(mensaje, this.postState, this.messages()).subscribe({
      next: (res) => {
        this.updateLastAssistantMessage(res.respuesta);
        if (res.post_modificado) {
          this.postState = res.respuesta;
        }
      },
      error: (err) => {
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

  private detectTopicSuggestion(text: string): boolean {
    return /sugi?er[ea]\s+temas?/i.test(text) || /temas?\s+trending/i.test(text);
  }
}
