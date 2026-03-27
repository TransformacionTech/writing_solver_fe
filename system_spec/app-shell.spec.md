# Spec: App Shell

## Archivos

- `src/main.ts` — Bootstrap con `bootstrapApplication(App, appConfig)`
- `src/app/app.ts` — Componente raiz, ejecuta `authService.restoreSession()` en `ngOnInit`
- `src/app/app.html` — Solo `<router-outlet />`
- `src/app/app.config.ts` — Providers globales
- `src/app/app.routes.ts` — Arbol de rutas
- `src/environments/environment.ts` — Config dev
- `src/environments/environment.prod.ts` — Config prod
- `src/styles.scss` — Tema Material M2, utilidades CSS globales

## Providers registrados en `appConfig`

| Provider | Detalle |
|----------|---------|
| `provideRouter` | Con `withComponentInputBinding()` y `withViewTransitions()` |
| `provideHttpClient` | Interceptors: `authInterceptor`, `errorInterceptor` |
| `provideAnimationsAsync` | Animaciones de Angular Material |
| `MarkdownModule.forRoot` | Renderer custom que convierte bloques `mermaid` en `<div class="mermaid">` |
| `provideBrowserGlobalErrorListeners` | Captura errores globales |

## Arbol de rutas

```
/                   → redirect /dashboard
/dashboard          → DashboardComponent        (lazy, authGuard)
/writing-solver     → WritingSolverComponent     (lazy, authGuard)
/settings           → SettingsComponent          (lazy, authGuard)
/auth/login         → LoginComponent             (lazy, sin guard)
/auth               → redirect /auth/login
/**                 → redirect /dashboard
```

- Todas las rutas protegidas comparten `MainLayoutComponent` como parent layout.
- Cada feature se carga con `loadComponent()` o `loadChildren()`.

## Environments

| Variable | Dev | Prod |
|----------|-----|------|
| `production` | `false` | `true` |
| `apiUrl` | `https://localhost:7018` | `/api` |
| `wsUrl` | `ws://localhost:3000/ws` | `/ws` |
| `appVersion` | `1.0.0` | `1.0.0` |

## Tema global (`styles.scss`)

- Palette primary: Indigo 700
- Palette accent: Deep Purple A200
- Palette warn: Red
- Tema claro M2 con `mat.all-component-themes`
- Utilidades: `.full-width`, `.text-center`, `.mt-8`, `.mb-8`, `.gap-8`, `.flex`, `.flex-col`, `.items-center`, `.justify-between`
