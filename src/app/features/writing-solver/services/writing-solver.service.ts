import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PipelineEvent,
  ChatResponse,
  SuggestTopicsResponse,
  ChatMessage,
} from '../models/writing-solver.model';

@Injectable({ providedIn: 'root' })
export class WritingSolverService {
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Inicia el pipeline de generacion de post via SSE.
   * Eventos: { type: "progress", agent, message }, { type: "result", post, score }, { type: "done" }
   */
  runPipeline(topic: string, context?: string, userId?: string): { events$: Observable<PipelineEvent>; abort: () => void } {
    const controller = new AbortController();

    const events$ = new Observable<PipelineEvent>(observer => {
      const url = `${this.apiUrl}/pipeline/run`;
      const token = localStorage.getItem('auth_token');

      fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ topic, context, user_id: userId }),
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
                  // linea SSE malformada, ignorar
                }
              }
            }

            read();
          }).catch(err => {
            if (err.name !== 'AbortError') {
              this.ngZone.run(() => observer.error(err));
            }
          });
        };

        read();
      }).catch(err => {
        if (err.name !== 'AbortError') {
          this.ngZone.run(() => observer.error(err));
        }
      });

      return () => controller.abort();
    });

    return { events$, abort: () => controller.abort() };
  }

  /** GET /pipeline/suggest-topics */
  suggestTopics(): Observable<SuggestTopicsResponse> {
    return this.http.get<SuggestTopicsResponse>(`${this.apiUrl}/pipeline/suggest-topics`);
  }

  /** POST /pipeline/chat */
  chatAboutPost(mensaje: string, postActual: string, history: ChatMessage[]): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/pipeline/chat`, {
      mensaje,
      post_actual: postActual,
      history: history.map(m => ({ role: m.role, content: m.content })),
    });
  }

}
