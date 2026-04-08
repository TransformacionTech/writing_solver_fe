import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule],
  templateUrl: './knowledge-base.component.html',
  styles: [`
    :host { display: block; height: 100%; overflow: auto; }

    .page-container { padding: 24px 32px; max-width: 900px; margin: 0 auto; }

    .page-header {
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 1.6rem; font-weight: 600; color: var(--ws-text); }
    }
    .page-subtitle { font-size: 0.85rem; color: var(--ws-text-muted); margin-top: 4px; }

    /* Drop zone */
    .drop-zone {
      border: 2px dashed var(--ws-border-strong);
      border-radius: 12px;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--ws-surface);
      transition: background-color 0.3s, border-color 0.3s;

      &:hover, &--active {
        border-color: var(--ws-primary);
        background: var(--ws-primary-bg);
      }

      &--error {
        border-color: #c62828;
        background: rgba(198, 40, 40, 0.04);
      }
    }
    .drop-icon {
      font-size: 3rem; width: 3rem; height: 3rem;
      color: var(--ws-icon-muted);
    }
    .drop-zone:hover .drop-icon,
    .drop-zone--active .drop-icon { color: var(--ws-primary); }
    .drop-text { font-size: 0.9rem; color: var(--ws-text-muted); }
    .drop-hint { font-size: 0.78rem; color: var(--ws-text-hint); }
    .btn-select {
      background: #6200EA !important;
      color: white !important;
      border-radius: 8px;
      margin-top: 4px;
    }

    /* Upload progress */
    .upload-card {
      margin-top: 16px;
      padding: 16px;
      border-radius: 12px;
    }
    .upload-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .upload-filename { font-size: 0.88rem; font-weight: 500; flex: 1; }
    .upload-status { font-size: 0.78rem; color: var(--ws-text-muted); }

    /* Error */
    .error-text {
      color: #c62828;
      font-size: 0.82rem;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* File list */
    .files-section {
      margin-top: 32px;
    }
    .files-title {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--ws-text-secondary);
    }
    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--ws-surface);
      border: 1px solid var(--ws-border);
      transition: background-color 0.3s, border-color 0.3s;
      border-radius: 10px;
    }
    .file-icon {
      color: #6200EA;
      font-size: 1.3rem; width: 1.3rem; height: 1.3rem;
    }
    .file-details { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .file-name { font-size: 0.88rem; font-weight: 500; color: var(--ws-text); }
    .file-meta { font-size: 0.75rem; color: var(--ws-text-muted); }
    .file-remove {
      color: var(--ws-text-hint);
      &:hover { color: #c62828; }
    }
    .files-empty {
      text-align: center;
      padding: 32px;
      color: var(--ws-text-hint);
      font-size: 0.85rem;
    }

    input[type="file"] { display: none; }
  `],
})
export class KnowledgeBaseComponent {
  protected readonly kbService = inject(KnowledgeBaseService);
  private readonly notificationService = inject(NotificationService);

  readonly isUploading = signal(false);
  readonly uploadingFilename = signal('');
  readonly isDragOver = signal(false);
  readonly validationError = signal('');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.kbService.removeFromHistory(index);
  }

  private processFile(file: File): void {
    this.validationError.set('');

    const error = this.kbService.validateFile(file);
    if (error) {
      this.validationError.set(error);
      return;
    }

    this.isUploading.set(true);
    this.uploadingFilename.set(file.name);

    this.kbService.uploadFile(file).subscribe({
      next: (response) => {
        this.kbService.addToHistory(response);
        this.notificationService.success(
          `${response.filename}: ${response.chunks_stored} chunks almacenados`
        );
        this.isUploading.set(false);
        this.uploadingFilename.set('');
      },
      error: () => {
        this.notificationService.error('Error al subir el archivo');
        this.isUploading.set(false);
        this.uploadingFilename.set('');
      },
    });
  }
}
