# Spec: Conventions

Reglas de codigo y patrones que todo feature nuevo debe seguir.

## Estructura de un feature

```
src/app/features/mi-feature/
├── mi-feature.component.ts        # Logica + styles inline
├── mi-feature.component.html      # Template separado
├── services/
│   └── mi-feature.service.ts      # Extiende BaseApiService si llama API
└── models/
    └── mi-feature.model.ts        # Interfaces y tipos
```

## Reglas obligatorias

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| HTML separado | `templateUrl: './x.component.html'` | `template: \`...\`` |
| Styles inline | `styles: [\`...\`]` | archivo `.scss` separado |
| Standalone | `standalone: true` en todos los componentes | NgModules |
| Signals para estado | `signal()`, `computed()` | `BehaviorSubject`, `ReplaySubject` |
| Inyeccion | `inject(Service)` | `constructor(private svc: Service)` |
| Inputs | `input()`, `input.required()` | `@Input()` |
| Outputs | `output()` | `@Output()` |
| Control flow | `@if`, `@for`, `@else` | `*ngIf`, `*ngFor` |
| Lazy loading | `loadComponent()` / `loadChildren()` | imports eagerly |
| Guards | `CanActivateFn` (funcion) | Clase con `CanActivate` |
| Interceptors | `HttpInterceptorFn` (funcion) | Clase con `HttpInterceptor` |
| Idioma UI | Espanol | Ingles en labels visibles |
| Emojis | Nunca en UI | — |

## Excepcion

`BaseApiService` usa `constructor(protected readonly http: HttpClient)` porque es clase abstracta y `HttpClient` debe inyectarse en la cadena de herencia.

## Agregar un feature nuevo

1. Crear carpeta en `src/app/features/mi-feature/`
2. Crear `mi-feature.component.ts` + `.html`
3. Si tiene sub-rutas: crear `mi-feature.routes.ts` con `export const MI_FEATURE_ROUTES: Routes = [...]`
4. Agregar ruta en `src/app/app.routes.ts` como child lazy-loaded del `MainLayoutComponent`
5. Agregar item en `src/app/layout/sidebar/sidebar.component.ts` → array `navItems`

## Componentes Material usados

MatToolbar, MatButton, MatIcon, MatMenu, MatList, MatFormField, MatInput, MatCard, MatBadge, MatProgressSpinner, MatDivider, MatTooltip

## Jerarquia de componentes

```
App
└── MainLayoutComponent (rutas protegidas)
    ├── SidebarComponent
    ├── HeaderComponent
    ├── <router-outlet> → Feature components
    └── NotificationToastComponent
```

## Estado global (signals)

| Signal | Servicio | Proposito |
|--------|----------|-----------|
| `AuthService.state` | Auth | Usuario y sesion |
| `NotificationService.notifications` | Core | Toasts activos |
| `LoadingService.isLoading` | Core | Requests HTTP en curso |
