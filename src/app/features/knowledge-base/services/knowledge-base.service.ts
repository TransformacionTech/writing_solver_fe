import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RagUploadResponse, UploadedFile } from '../models/knowledge-base.model';

const STORAGE_KEY = 'rag_uploaded_files';
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx'];

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  readonly uploadedFiles = signal<UploadedFile[]>(this.loadFromStorage());

  uploadFile(file: File): Observable<RagUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<RagUploadResponse>(
      `${this.baseUrl}/pipeline/upload-rag`,
      formData,
    );
  }

  validateFile(file: File): string | null {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Extension no permitida: ${ext}. Solo se aceptan ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    return null;
  }

  addToHistory(response: RagUploadResponse): void {
    const entry: UploadedFile = {
      filename: response.filename,
      chunks: response.chunks_stored,
      documentIds: response.document_ids,
      uploadedAt: new Date().toISOString(),
    };
    this.uploadedFiles.update(list => [entry, ...list]);
    this.saveToStorage();
  }

  removeFromHistory(index: number): void {
    this.uploadedFiles.update(list => list.filter((_, i) => i !== index));
    this.saveToStorage();
  }

  private loadFromStorage(): UploadedFile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.uploadedFiles()));
  }
}
