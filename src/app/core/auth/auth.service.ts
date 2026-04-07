import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthState, User, GithubAuthResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  readonly state = this._state.asReadonly();
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly currentUser = computed(() => this._state().user);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Redirige al flujo OAuth de GitHub. */
  loginWithGithub(): void {
    const clientId = environment.githubClientId;
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href =
      `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
  }

  /** Intercambia el code de GitHub por un JWT del backend. */
  handleGithubCallback(code: string): Observable<GithubAuthResponse> {
    this._state.update(s => ({ ...s, isLoading: true }));

    return this.http
      .post<GithubAuthResponse>(`${environment.apiUrl}/auth/github`, { code })
      .pipe(
        tap((res) => {
          const user: User = {
            id: res.user.id,
            username: res.user.username,
            email: res.user.email,
            avatar_url: res.user.avatar_url,
            roles: ['usuario'],
          };

          if (this.isBrowser) {
            localStorage.setItem(AUTH_TOKEN_KEY, res.access_token);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          }

          this._state.set({ user, isAuthenticated: true, isLoading: false });
        }),
      );
  }

  /** Guarda un JWT recibido directamente (redirect del backend). */
  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      // Decodificar payload del JWT para extraer datos del usuario
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.sub ?? payload.id ?? '',
          username: payload.username ?? payload.name ?? '',
          email: payload.email ?? '',
          avatar_url: payload.avatar_url,
          roles: payload.roles ?? ['usuario'],
        };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        this._state.set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        // Si el JWT no tiene payload decodificable, guardar solo el token
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        this._state.set({
          user: { id: '', username: 'Usuario', email: '', roles: ['usuario'] },
          isAuthenticated: true,
          isLoading: false,
        });
      }
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    this._state.set({ user: null, isAuthenticated: false, isLoading: false });
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  restoreSession(): void {
    if (!this.isBrowser) return;
    const token = this.getToken();
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (token && raw) {
      try {
        const user: User = JSON.parse(raw);
        this._state.set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        this.logout();
      }
    }
  }
}
