import { Injectable, signal } from '@angular/core';

export interface Draft {
  id: string;
  topic: string;
  content: string;
  score: number | null;
  savedAt: string;
}

const STORAGE_KEY = 'ws_drafts';

@Injectable({ providedIn: 'root' })
export class DraftService {
  readonly drafts = signal<Draft[]>(this.loadFromStorage());

  save(topic: string, content: string, score: number | null): Draft {
    const draft: Draft = {
      id: crypto.randomUUID(),
      topic,
      content,
      score,
      savedAt: new Date().toISOString(),
    };
    this.drafts.update(list => [draft, ...list]);
    this.persist();
    return draft;
  }

  remove(id: string): void {
    this.drafts.update(list => list.filter(d => d.id !== id));
    this.persist();
  }

  load(id: string): Draft | undefined {
    return this.drafts().find(d => d.id === id);
  }

  private loadFromStorage(): Draft[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drafts()));
  }
}
