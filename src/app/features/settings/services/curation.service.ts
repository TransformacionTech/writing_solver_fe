import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
}

export interface CurationRun {
  id: string;
  run_at: string;
  status: string;
  topics_found: number;
  email_sent: boolean;
  error_message: string | null;
}

export interface CurationStreamEvent {
  type: 'progress' | 'result' | 'error' | 'done';
  step?: string;
  message?: string;
  detail?: unknown;
}

@Injectable({ providedIn: 'root' })
export class CurationService {
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  private readonly apiUrl = environment.apiUrl;

  listSubscribers(): Observable<Subscriber[]> {
    return this.http.get<Subscriber[]>(`${this.apiUrl}/curation/subscribers`);
  }

  addSubscriber(email: string): Observable<Subscriber> {
    return this.http.post<Subscriber>(`${this.apiUrl}/curation/subscribers`, { email });
  }

  listRuns(limit = 10): Observable<CurationRun[]> {
    return this.http.get<CurationRun[]>(`${this.apiUrl}/curation/runs?limit=${limit}`);
  }

  /** Dispara la curación con streaming SSE para ver el progreso en tiempo real. */
  runStream(): { events$: Observable<CurationStreamEvent>; abort: () => void } {
    const controller = new AbortController();

    const events$ = new Observable<CurationStreamEvent>(observer => {
      const token = localStorage.getItem('auth_token');

      fetch(`${this.apiUrl}/curation/run-stream`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).then(response => {
        if (!response.ok) {
          this.ngZone.run(() => observer.error(new Error(`HTTP ${response.status}`)));
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
                  const evt: CurationStreamEvent = JSON.parse(line.slice(6));
                  this.ngZone.run(() => observer.next(evt));
                } catch {
                  /* linea SSE malformada */
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
}
