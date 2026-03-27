# Spec: Shared

## Archivos

### Modelos
- `src/app/shared/models/auth.model.ts` — `User`, `AuthState`
- `src/app/shared/models/common.model.ts` — `ApiResponse<T>`, `PagedResponse<T>`, `AppError`
- `src/app/shared/models/index.ts` — Re-exporta todo

### Componentes
- `src/app/shared/components/notification-toast/notification-toast.component.ts|html`
- `src/app/shared/components/status-badge/status-badge.component.ts|html`
- `src/app/shared/components/loading-spinner/loading-spinner.component.ts|html`

### Servicios core relacionados
- `src/app/core/services/notification.service.ts`
- `src/app/core/services/base-api.service.ts`

## Modelos comunes

```typescript
interface ApiResponse<T> { data: T; message?: string; success: boolean }
interface PagedResponse<T> { items: T[]; total: number; page: number; pageSize: number }
interface AppError { code: string; message: string; details?: unknown }
```

## NotificationService

Singleton. Gestiona toasts con auto-dismiss.

### Signals

- `notifications: ReadonlySignal<Notification[]>`
- `hasNotifications: ComputedSignal<boolean>`

### Metodos

| Metodo | Duracion | Descripcion |
|--------|----------|-------------|
| `show(type, message, duration?)` | Custom | Crea notificacion con auto-dismiss |
| `success(message)` | 4s | Toast verde |
| `error(message)` | 6s | Toast rojo |
| `warning(message)` | 4s | Toast naranja |
| `info(message)` | 4s | Toast azul |
| `dismiss(id)` | — | Elimina notificacion |

### Notification interface

```typescript
{ id: string; type: 'success'|'error'|'warning'|'info'; message: string; duration?: number }
```

## NotificationToastComponent

Selector: `<app-notification-toast>`

- Posicion fija bottom-right, z-index 10000
- Itera `notificationService.notifications()` con `@for`
- Iconos: success→check_circle, error→error, warning→warning, info→info
- Animacion slide-in desde la derecha
- Boton close para dismiss manual

## StatusBadgeComponent

Selector: `<app-status-badge [status]="valor">`

- Input signal requerido: `status: InputSignal<string>`
- Clases CSS por estado: idle (gris), running/active (verde), paused (naranja), error/failed (rojo), completed (azul), draft (morado)

## LoadingSpinnerComponent

Selector: `<app-loading-spinner>`

- Inyecta `LoadingService`
- Muestra overlay con `MatSpinner` cuando `isLoading()` es true
- Overlay semi-transparente, z-index 9999

## BaseApiService

Clase abstracta. Inyecta `HttpClient` via constructor (unica excepcion a la regla de `inject()`).

### Metodos protegidos

| Metodo | Descripcion |
|--------|-------------|
| `get<T>(path, params?)` | GET con query params opcionales |
| `post<T>(path, body)` | POST |
| `put<T>(path, body)` | PUT |
| `patch<T>(path, body)` | PATCH |
| `delete<T>(path)` | DELETE |
| `getList<T>(path, page, pageSize)` | GET paginado → `PagedResponse<T>` |
| `getOne<T>(path)` | GET unitario → `ApiResponse<T>` |

Base URL: `environment.apiUrl`
