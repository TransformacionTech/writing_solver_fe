import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'ws_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(this.loadTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.body.classList.toggle('dark', dark);
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
