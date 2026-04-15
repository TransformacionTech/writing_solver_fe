import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { Subscription } from 'rxjs';
import { WritingSolverService } from '../writing-solver/services/writing-solver.service';
import { NotificationService } from '../../core/services/notification.service';
import { DraftService } from '../../core/services/draft.service';
import { DocxExportService } from '../../core/services/docx-export.service';
import { KnowledgeBaseService } from '../knowledge-base/services/knowledge-base.service';
import { AuthService } from '../../core/auth/auth.service';
import { PipelineEvent, ChatMessage } from '../writing-solver/models/writing-solver.model';

type PipelinePhase = 'idle' | 'researcher' | 'writer' | 'editor' | 'completed' | 'error';

interface AgentStep {
  agent: string;
  label: string;
  icon: string;
  messages: string[];
  status: 'pending' | 'active' | 'done';
}

interface PostVersion {
  content: string;
  score: number | null;
  timestamp: Date;
}

const STEP_ORDER = ['researcher', 'writer', 'editor'];

@Component({
  selector: 'app-new-post',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  templateUrl: './new-post.component.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .page-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px 32px 0;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      overflow: hidden;
    }

    .page-header {
      margin-bottom: 8px;
      flex-shrink: 0;
      h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    }
    .page-header h1 { color: var(--ws-text); }
    .page-subtitle { font-size: 0.82rem; color: var(--ws-text-muted); margin-top: 2px; }

    /* Content area */
    .content-area {
      flex: 1;
      display: flex;
      gap: 16px;
      overflow: hidden;
      padding-bottom: 8px;
    }

    .content-area--full {
      justify-content: center;
    }

    /* Editor panel */
    .editor-panel {
      background: var(--ws-surface);
      border-radius: 12px;
      border: 1px solid var(--ws-border);
      transition: background-color 0.3s, border-color 0.3s;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      flex: 1;
    }

    .editor-panel--full {
      max-width: 800px;
    }

    .editor-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--ws-border);
      gap: 8px;
    }
    .editor-toolbar-left { display: flex; gap: 8px; }
    .btn-regenerate {
      color: var(--ws-text-secondary);
      border: 1px solid var(--ws-border-strong);
      border-radius: 8px;
      font-size: 0.82rem;
    }
    .btn-save-draft {
      color: var(--ws-text-secondary);
      border: 1px solid var(--ws-border-strong);
      border-radius: 8px;
      font-size: 0.82rem;
    }
    .btn-publish {
      background: #6200EA !important;
      color: white !important;
      border-radius: 8px;
      font-size: 0.82rem;
    }

    .editor-content {
      flex: 1;
      padding: 20px;
      overflow: auto;
      font-size: 0.9rem;
      line-height: 1.7;
      min-height: 0;
    }

    /* Empty state */
    .editor-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--ws-text-hint);
      gap: 16px;
      text-align: center;
      mat-icon { font-size: 3rem; width: 3rem; height: 3rem; opacity: 0.4; }
      p { margin: 0; font-size: 0.88rem; max-width: 320px; }
    }

    /* Drafts */
    .drafts-section {
      width: 100%;
      max-width: 420px;
      text-align: left;
    }
    .drafts-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--ws-text-hint);
      display: block;
      margin-bottom: 8px;
    }
    .drafts-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .draft-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--ws-border);
      background: var(--ws-surface);
      transition: all 0.15s;
      &:hover { border-color: var(--ws-primary); box-shadow: 0 1px 4px rgba(98,0,234,0.1); }
    }
    .draft-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      cursor: pointer;
      min-width: 0;
    }
    .draft-topic {
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--ws-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .draft-meta {
      font-size: 0.7rem;
      color: var(--ws-text-hint);
    }
    .draft-remove {
      opacity: 0.3;
      flex-shrink: 0;
      width: 28px !important;
      height: 28px !important;
      &:hover { opacity: 1; }
    }

    /* Agent processing */
    .editor-processing {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0;
    }

    .agent-step {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--ws-border);
      &:last-child { border-bottom: none; }
    }

    .agent-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      width: 36px;
    }

    .agent-circle {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem;
      background: var(--ws-border-strong); color: var(--ws-text-hint);
      transition: all 0.3s;

      &--active {
        background: #6200EA; color: white;
        animation: pulse 1.5s infinite;
      }
      &--done {
        background: #4caf50; color: white;
      }

      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
    }

    .agent-line {
      width: 2px; flex: 1;
      background: var(--ws-border-strong);
      &--active { background: var(--ws-primary); }
      &--done { background: var(--ws-success); }
    }

    .agent-content { flex: 1; min-width: 0; }

    .agent-header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 4px;
    }
    .agent-name {
      font-size: 0.82rem; font-weight: 600; color: var(--ws-text-secondary);
      &--active { color: var(--ws-primary); }
      &--done { color: var(--ws-success); }
    }
    .agent-status-text {
      font-size: 0.72rem; color: var(--ws-text-hint);
      &--active { color: var(--ws-primary); }
    }

    .agent-messages {
      display: flex; flex-direction: column; gap: 2px;
    }
    .agent-msg {
      font-size: 0.78rem;
      color: var(--ws-text-muted);
      line-height: 1.4;
      animation: fadeIn 0.3s ease;
    }
    .agent-msg:last-child {
      color: var(--ws-text-secondary);
      font-weight: 500;
    }

    .agent-pending {
      font-size: 0.78rem;
      color: var(--ws-text-hint);
      font-style: italic;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(98, 0, 234, 0.3); }
      50% { box-shadow: 0 0 0 6px rgba(98, 0, 234, 0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Input area */
    .input-area {
      display: flex;
      gap: 12px;
      padding: 16px 20px;
      background: var(--ws-surface-alt);
      border-top: 1px solid var(--ws-border);
      align-items: center;
    }
    .input-field { flex: 1; }
    ::ng-deep .input-area .mat-mdc-form-field-subscript-wrapper { display: none; }
    .btn-generate {
      background: #6200EA !important;
      color: white !important;
      height: 56px;
      border-radius: 8px;
      min-width: 120px;
    }
    .btn-stop {
      background: #d32f2f !important;
      color: white !important;
      height: 56px;
      border-radius: 8px;
      min-width: 120px;
    }

    /* Chat messages */
    .chat-messages {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--ws-border);
    }
    .chat-msg {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      line-height: 1.5;
      max-width: 85%;
      animation: fadeIn 0.2s ease;
    }
    .chat-msg--user {
      background: var(--ws-primary-bg);
      color: var(--ws-text);
      align-self: flex-end;
    }
    .chat-msg--assistant {
      background: var(--ws-surface-alt);
      color: var(--ws-text);
      align-self: flex-start;

      ::ng-deep markdown {
        p { margin: 2px 0; }
        strong { font-weight: 600; }
        ul, ol { margin: 2px 0; padding-left: 16px; }
      }
    }
    .chat-typing {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 0.78rem;
      color: var(--ws-text-hint);
    }

    /* Score badge */
    .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.82rem;
      font-weight: 600;
      margin-top: 12px;
      background: var(--ws-primary-bg);
      color: var(--ws-primary);
    }

    /* Process log */
    .process-log {
      margin-top: 16px;
      padding: 12px;
      background: var(--ws-surface-alt);
      border-radius: 8px;
      font-size: 0.78rem;
      color: var(--ws-text-muted);
      max-height: 150px;
      overflow: auto;
    }
    .log-title { font-weight: 600; margin-bottom: 6px; }
    .log-entry { padding: 2px 0; }

    /* Versions */
    .versions-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--ws-border);
      overflow-x: auto;
      flex-shrink: 0;
    }
    .versions-label {
      font-size: 0.72rem;
      color: var(--ws-text-hint);
      font-weight: 500;
      white-space: nowrap;
      margin-right: 4px;
    }
    .version-chip {
      font-size: 0.72rem;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 16px;
      border: 1px solid var(--ws-border-strong);
      background: var(--ws-surface);
      color: var(--ws-text-secondary);
      white-space: nowrap;
      transition: all 0.2s;
      &:hover { border-color: #6200EA; color: #6200EA; }
      &.version-chip--active {
        background: #6200EA;
        color: white;
        border-color: #6200EA;
      }
    }

    /* Preview panel */
    .preview-panel {
      background: var(--ws-surface);
      border-radius: 12px;
      border: 1px solid var(--ws-border);
      transition: background-color 0.3s, border-color 0.3s;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      flex: 1;
      max-width: 500px;
    }
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--ws-border);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--ws-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .preview-close {
      opacity: 0.5;
      &:hover { opacity: 1; }
    }
    .btn-toggle-preview {
      font-size: 0.78rem;
      color: var(--ws-text-muted);
      border: 1px solid var(--ws-border-strong);
      border-radius: 8px;
    }
    .preview-content {
      flex: 1;
      padding: 20px;
      overflow: auto;
      min-height: 0;
    }

    /* LinkedIn mockup */
    .linkedin-mockup {
      background: var(--ws-surface);
      border: 1px solid var(--ws-border-strong);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .li-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
    }
    .li-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: #6200EA;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: 1rem;
      flex-shrink: 0;
    }
    .li-user-info {
      display: flex; flex-direction: column; gap: 1px;
    }
    .li-user-name { font-size: 0.88rem; font-weight: 600; color: var(--ws-text); }
    .li-user-title { font-size: 0.72rem; color: var(--ws-text-muted); }
    .li-timestamp { font-size: 0.68rem; color: var(--ws-text-hint); }
    .li-body {
      padding: 0 16px 16px;
      font-size: 0.85rem;
      line-height: 1.6;
      color: var(--ws-text);
      word-break: break-word;

      ::ng-deep markdown {
        h1, h2, h3, h4 { font-size: 0.95rem; margin: 8px 0 4px; }
        p { margin: 4px 0; }
        ul, ol { margin: 4px 0; padding-left: 20px; }
        strong { font-weight: 600; }
        a { color: #0a66c2; text-decoration: none; font-weight: 500; &:hover { text-decoration: underline; } }
        blockquote {
          margin: 4px 0;
          padding-left: 10px;
          border-left: 2px solid #ccc;
          color: #555;
        }
      }
    }
    .li-see-more {
      display: inline;
      color: var(--ws-text-muted);
      font-weight: 500;
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }
    .li-actions {
      display: flex;
      border-top: 1px solid var(--ws-border-strong);
      padding: 4px 8px;
    }
    .li-action {
      flex: 1; display: flex; align-items: center; justify-content: center;
      gap: 4px; padding: 8px; border-radius: 4px; cursor: default;
      font-size: 0.75rem; color: var(--ws-text-muted); font-weight: 600;
      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    }
  `],
})
export class NewPostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly solverService = inject(WritingSolverService);
  private readonly notificationService = inject(NotificationService);
  protected readonly draftService = inject(DraftService);
  private readonly docxService = inject(DocxExportService);
  private readonly kbService = inject(KnowledgeBaseService);
  protected readonly authService = inject(AuthService);

  readonly topic = signal('');
  readonly chatInput = signal('');
  readonly postContent = signal('');
  readonly postScore = signal<number | null>(null);
  readonly processLog = signal<string[]>([]);
  readonly phase = signal<PipelinePhase>('idle');
  readonly chatHistory = signal<ChatMessage[]>([]);
  readonly isChatLoading = signal(false);
  readonly versions = signal<PostVersion[]>([]);
  readonly activeVersion = signal(0);
  readonly showPreview = signal(true);
  readonly isPreviewExpanded = signal(false);

  private pipelineSubscription: Subscription | null = null;
  private abortPipeline: (() => void) | null = null;

  readonly agentSteps = signal<AgentStep[]>([
    { agent: 'researcher', label: 'Researcher', icon: 'search', messages: [], status: 'pending' },
    { agent: 'writer', label: 'Writer', icon: 'edit_note', messages: [], status: 'pending' },
    { agent: 'editor', label: 'Editor', icon: 'rate_review', messages: [], status: 'pending' },
  ]);

  readonly isProcessing = computed(() => {
    const p = this.phase();
    return p === 'researcher' || p === 'writer' || p === 'editor';
  });

  readonly hasPost = computed(() => !!this.postContent());

  readonly previewText = computed(() => {
    const content = this.postContent();
    if (!content) return '';
    const text = this.isPreviewExpanded() ? content : (content.length > 280 ? content.slice(0, 280) : content);
    // Escapar hashtags para que markdown no los interprete como headings
    // y envolverlos como links styled para el azul LinkedIn
    return text.replace(/(^|\s)(#(\w[\w]*))/gm, '$1[**$2**](hashtag-$3)');
  });

  readonly isPreviewTruncated = computed(() => this.postContent().length > 280);

  ngOnInit(): void {
    const topicParam = this.route.snapshot.queryParamMap.get('topic');
    if (topicParam) {
      this.topic.set(topicParam);
      this.generate();
    }
  }

  generate(): void {
    const tema = this.topic().trim();
    if (!tema || this.isProcessing()) return;

    this.postContent.set('');
    this.postScore.set(null);
    this.processLog.set([]);
    this.chatHistory.set([]);
    this.phase.set('researcher');
    this.agentSteps.set([
      { agent: 'researcher', label: 'Researcher', icon: 'search', messages: [], status: 'active' },
      { agent: 'writer', label: 'Writer', icon: 'edit_note', messages: [], status: 'pending' },
      { agent: 'editor', label: 'Editor', icon: 'rate_review', messages: [], status: 'pending' },
    ]);

    const { events$, abort } = this.solverService.runPipeline(tema);
    this.abortPipeline = abort;

    this.pipelineSubscription = events$.subscribe({
      next: (event) => this.handleEvent(event),
      error: (err) => {
        this.phase.set('error');
        this.notificationService.error('Error en el pipeline');
        this.abortPipeline = null;
      },
    });
  }

  improve(): void {
    if (this.topic().trim()) {
      this.generate();
    }
  }

  stop(): void {
    if (this.abortPipeline) {
      this.abortPipeline();
      this.abortPipeline = null;
    }
    this.pipelineSubscription?.unsubscribe();
    this.pipelineSubscription = null;
    this.phase.set('idle');
    this.agentSteps.update(steps =>
      steps.map(s => s.status === 'active' ? { ...s, status: 'pending' as const } : s)
    );
    this.notificationService.info('Pipeline detenido');
  }

  saveDraft(): void {
    const content = this.postContent();
    const tema = this.topic();
    if (!content) return;

    this.draftService.save(tema, content, this.postScore());
    this.notificationService.info('Borrador guardado');
  }

  loadDraft(id: string): void {
    const draft = this.draftService.load(id);
    if (!draft) return;
    this.topic.set(draft.topic);
    this.postContent.set(draft.content);
    this.postScore.set(draft.score);
    this.phase.set('completed');
  }

  removeDraft(id: string): void {
    this.draftService.remove(id);
  }

  async publish(): Promise<void> {
    const content = this.postContent();
    const tema = this.topic();
    if (!content) return;

    try {
      // Generar y descargar .docx
      const { blob, filename } = await this.docxService.exportPost(content, tema, this.postScore());

      // Subir el .docx al RAG
      const file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      this.kbService.uploadFile(file).subscribe({
        next: (response) => {
          this.kbService.addToHistory(response);
          this.notificationService.success('Post aprobado, descargado y guardado en la base de conocimiento');
        },
        error: () => this.notificationService.error('Post descargado pero fallo al guardar en RAG'),
      });
    } catch {
      this.notificationService.error('Error al generar el archivo .docx');
    }
  }

  togglePreview(): void {
    this.showPreview.update(v => !v);
  }

  togglePreviewExpand(): void {
    this.isPreviewExpanded.update(v => !v);
  }

  sendChatMessage(): void {
    const msg = this.chatInput().trim();
    if (!msg || this.isChatLoading()) return;

    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date() };
    this.chatHistory.update(h => [...h, userMsg]);
    this.chatInput.set('');
    this.isChatLoading.set(true);

    this.solverService.chatAboutPost(msg, this.postContent(), this.chatHistory()).subscribe({
      next: (res) => {
        const assistantMsg: ChatMessage = { role: 'assistant', content: res.respuesta, timestamp: new Date() };
        this.chatHistory.update(h => [...h, assistantMsg]);

        if (res.post_modificado) {
          this.postContent.set(res.respuesta);
          this.versions.update(v => [...v, {
            content: res.respuesta,
            score: this.postScore(),
            timestamp: new Date(),
          }]);
          this.activeVersion.set(this.versions().length - 1);
          this.notificationService.success('Post actualizado por el agente');
        }

        this.isChatLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al enviar mensaje');
        this.isChatLoading.set(false);
      },
    });
  }

  selectVersion(index: number): void {
    this.activeVersion.set(index);
    const version = this.versions()[index];
    if (version) {
      this.postContent.set(version.content);
      this.postScore.set(version.score);
    }
  }

  private handleEvent(event: PipelineEvent): void {
    switch (event.type) {
      case 'progress':
        this.handleProgress(event);
        break;

      case 'result': {
        const newScore = event.score ?? 0;
        const currentScore = this.postScore() ?? 0;
        const isFirstOrBetter = this.versions().length === 0 || newScore >= currentScore;

        this.phase.set('completed');
        this.abortPipeline = null;
        this.agentSteps.update(steps =>
          steps.map(s => ({ ...s, status: 'done' as const }))
        );
        this.versions.update(v => [...v, {
          content: event.post ?? '',
          score: event.score ?? null,
          timestamp: new Date(),
        }]);

        if (isFirstOrBetter) {
          this.postContent.set(event.post ?? '');
          this.postScore.set(event.score ?? null);
          this.activeVersion.set(this.versions().length - 1);
          this.notificationService.success(
            `Post generado con score ${event.score ?? '-'}/10`
          );
        } else {
          this.notificationService.info(
            `Nueva version con score ${newScore}/10 — se mantiene la version actual (${currentScore}/10)`
          );
        }
        break;
      }

      case 'error':
        this.phase.set('error');
        this.abortPipeline = null;
        this.notificationService.error(event.message ?? 'Error en el pipeline');
        this.processLog.update(log => [...log, `[error] ${event.message ?? 'Error desconocido'}`]);
        break;

      case 'done':
        if (this.phase() !== 'completed' && this.phase() !== 'error') {
          this.phase.set('completed');
        }
        break;
    }
  }

  private handleProgress(event: PipelineEvent): void {
    const agent = event.agent ?? '';
    const message = event.message ?? '';

    this.processLog.update(log => [...log, `[${agent}] ${message}`]);

    if (agent === 'researcher') {
      this.phase.set('researcher');
    } else if (agent === 'writer') {
      this.phase.set('writer');
    } else if (agent === 'editor' || agent === 'reader') {
      this.phase.set('editor');
    }

    this.agentSteps.update(steps => {
      const updated = steps.map(s => ({ ...s, messages: [...s.messages] }));
      const agentKey = (agent === 'reader') ? 'editor' : agent;
      const currentIndex = STEP_ORDER.indexOf(agentKey);

      for (let i = 0; i < updated.length; i++) {
        if (i < currentIndex) {
          updated[i].status = 'done';
        } else if (i === currentIndex) {
          updated[i].status = 'active';
          updated[i].messages.push(message);
        }
      }
      return updated;
    });
  }
}
