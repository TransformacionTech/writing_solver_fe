# Writing Solver — Frontend

UI del sistema multi-agente de posts LinkedIn (Tech And Solve). Consume APIs y streaming SSE. NO contiene logica de negocio ni agentes.

## Estrategia de ramas — LEER ANTES DE HACER CAMBIOS

| Rama | Proposito | Backend apuntado |
|---|---|---|
| `main` | Ejecucion local con `ng serve` | `http://localhost:8000` via proxy |
| `deploy` | Produccion en Render (build automatico) | `https://writing-solver-api.onrender.com` |

**Reglas:**
- Desarrollar en `main`. Cuando algo esta listo para produccion, hacer merge a `deploy`.
- NUNCA poner URLs de produccion hardcodeadas en `main`.
- NUNCA poner `localhost` en `deploy`.
- Los archivos que difieren entre ramas son: `environment.ts`, `environment.prod.ts`, `proxy.conf.json`.

### Archivos criticos por rama

**`main` (local):**
- `environment.ts` → `apiUrl: ''` (usa proxy), `githubClientId` de OAuth App local
- `proxy.conf.json` → target `http://localhost:8000`

**`deploy` (Render):**
- `environment.prod.ts` → `apiUrl: 'https://writing-solver-api.onrender.com'`, `githubClientId` de OAuth App de produccion
- `proxy.conf.json` → target `https://writing-solver-api.onrender.com` (usado solo en preview builds de Render)
- `public/_redirects` → redirige toda ruta a `index.html` para SPA routing en Render

## Stack
Angular 21.2 | Angular Material 21.2 | TypeScript 5.9 | RxJS 7.8 | ngx-markdown 21 + mermaid 11 | Vitest 4 | Prettier 3.8

## Comandos
- `npm start` — dev server (usa `environment.ts` + proxy a localhost:8000)
- `npm run build` — build produccion (usa `environment.prod.ts`)
- `npm test` — tests con Vitest
- `npm run watch` — build incremental dev

## Convenciones
- **Standalone components** — cero NgModules
- **templateUrl** separado + **styles inline** en el .ts
- **Signals** (`signal`, `computed`) para estado — no BehaviorSubject
- **`inject()`** para DI — no constructor injection (excepto BaseApiService)
- **`input()` / `output()`** signal-based — no decoradores @Input/@Output
- **Control flow** `@if`, `@for` — no directivas estructurales legacy
- **Lazy loading** con `loadComponent()` / `loadChildren()`
- **Guards e interceptors funcionales** (CanActivateFn, HttpInterceptorFn)
- UI en **espanol**, sin emojis

## Estructura
```
src/app/
├── core/           # auth, guards, interceptors, servicios base
├── shared/         # modelos, componentes reutilizables
├── layout/         # sidebar, header, main-layout
└── features/       # auth, dashboard, writing-solver, settings
```

## Restricciones
- El frontend NO contiene logica de agentes, NO detecta intencion, NO implementa OAuth
- Endpoints separados por accion: `/pipeline/run`, `/pipeline/suggest-topics`, `/pipeline/chat`, `/pipeline/update-rag`
- SSE via fetch nativo (no HttpClient) — ver `system_spec/api-contract.md`

## Specs detalladas
Ver `system_spec/index.md` — specs por dominio, cargar solo el relevante a la tarea.
