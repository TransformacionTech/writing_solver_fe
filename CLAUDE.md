# Writing Solver — Frontend

UI del sistema multi-agente de posts LinkedIn (Tech And Solve). Consume APIs y streaming SSE. NO contiene logica de negocio ni agentes.

## Stack
Angular 21.2 | Angular Material 21.2 | TypeScript 5.9 | RxJS 7.8 | ngx-markdown 21 + mermaid 11 | Vitest 4 | Prettier 3.8

## Comandos
- `npm start` — dev server
- `npm run build` — build produccion
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
