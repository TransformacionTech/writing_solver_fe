import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PipelineEvent,
  ChatResponse,
  TopicSuggestionResponse,
  RagUpdateResponse,
  ChatMessage,
} from '../models/writing-solver.model';

@Injectable({ providedIn: 'root' })
export class WritingSolverService {
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Inicia el pipeline de generacion de post via SSE.
   * El backend envia eventos Server-Sent Events con el progreso.
   */
  runPipeline(tema: string): Observable<PipelineEvent> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/pipeline/run`;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      }).then(response => {
        if (!response.ok) {
          this.ngZone.run(() => {
            observer.error(new Error(`Error HTTP ${response.status}`));
          });
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              this.ngZone.run(() => observer.complete());
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event: PipelineEvent = JSON.parse(line.slice(6));
                  this.ngZone.run(() => observer.next(event));
                } catch {
                  // linea SSE malformada, ignorar
                }
              }
            }

            read();
          }).catch(err => {
            this.ngZone.run(() => observer.error(err));
          });
        };

        read();
      }).catch(err => {
        this.ngZone.run(() => observer.error(err));
      });

      return () => {
        // cleanup si se desuscribe
      };
    });
  }

  /**
   * Sugiere temas via SSE (streaming).
   */
  suggestTopics(): Observable<PipelineEvent> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/pipeline/suggest-topics`;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => {
        if (!response.ok) {
          this.ngZone.run(() => observer.error(new Error(`Error HTTP ${response.status}`)));
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              this.ngZone.run(() => observer.complete());
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event: PipelineEvent = JSON.parse(line.slice(6));
                  this.ngZone.run(() => observer.next(event));
                } catch {
                  // ignorar
                }
              }
            }

            read();
          }).catch(err => this.ngZone.run(() => observer.error(err)));
        };

        read();
      }).catch(err => this.ngZone.run(() => observer.error(err)));
    });
  }

  /**
   * Envia un mensaje sobre el post existente (no SSE, request normal).
   */
  chatAboutPost(
    mensaje: string,
    postActual: string,
    history: ChatMessage[],
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/pipeline/chat`, {
      mensaje,
      post: postActual,
      history: history.map(m => ({ role: m.role, content: m.content })),
    });
  }

  /**
   * Actualiza la base de datos RAG.
   */
  updateRag(): Observable<RagUpdateResponse> {
    return this.http.post<RagUpdateResponse>(`${this.apiUrl}/pipeline/update-rag`, {});
  }
}
