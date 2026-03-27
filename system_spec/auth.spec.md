# Spec: Auth

## Archivos

- `src/app/core/auth/auth.service.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/core/interceptors/auth.interceptor.ts`
- `src/app/core/interceptors/error.interceptor.ts`
- `src/app/core/interceptors/loading.interceptor.ts`
- `src/app/features/auth/auth.routes.ts`
- `src/app/features/auth/pages/login/login.component.ts|html`
- `src/app/features/auth/models/mock-users.const.ts`
- `src/app/shared/models/auth.model.ts`

## AuthService

Servicio singleton (`providedIn: 'root'`). Estado basado en signals.

### Signals

| Signal | Tipo | Descripcion |
|--------|------|-------------|
| `state` | `ReadonlySignal<AuthState>` | Estado completo |
| `isAuthenticated` | `ComputedSignal<boolean>` | Derivado de `state` |
| `currentUser` | `ComputedSignal<User \| null>` | Derivado de `state` |

### Metodos

| Metodo | Retorno | Descripcion |
|--------|---------|-------------|
| `loginWithUser(user: User)` | `Observable<User>` | Genera mock JWT, guarda en localStorage, actualiza state |
| `logout()` | `void` | Limpia localStorage, resetea state, navega a `/auth/login` |
| `getToken()` | `string \| null` | Lee token de localStorage |
| `restoreSession()` | `void` | Restaura sesion desde localStorage al iniciar la app |

### Storage keys

- `auth_token` — JWT string
- `auth_user` — JSON del objeto `User`

## AuthState / User (modelos)

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

## Guard

`authGuard: CanActivateFn` — Si `isAuthenticated()` es true permite paso, sino redirige a `/auth/login`.

## Interceptors

### authInterceptor
- Agrega header `Authorization: Bearer {token}` a cada request si hay token.

### errorInterceptor
- **401**: ejecuta `logout()` y redirige a `/auth/login`
- **403**: redirige a `/forbidden`
- Otros errores: re-lanza el error para manejo en componente.

### loadingInterceptor
- `LoadingService` con signal `isLoading` y contador de requests activos.
- Incrementa al iniciar request, decrementa con `finalize`.

## Login (mock)

Pagina de seleccion de perfil. 3 usuarios predefinidos:

| ID | Nombre | Email | Rol | Icono |
|----|--------|-------|-----|-------|
| usr-001 | Admin User | admin@app.com | Administrador | admin_panel_settings |
| usr-002 | Normal User | user@app.com | Usuario | person |
| usr-003 | Viewer User | viewer@app.com | Lector | visibility |

Click en tarjeta → `authService.loginWithUser()` → navega a `/dashboard`.
