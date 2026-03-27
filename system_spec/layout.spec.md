# Spec: Layout

## Archivos

- `src/app/layout/main-layout/main-layout.component.ts|html`
- `src/app/layout/sidebar/sidebar.component.ts|html`
- `src/app/layout/header/header.component.ts|html`

## MainLayoutComponent

Shell principal que envuelve todas las rutas protegidas.

### Estructura del template

```
.app-shell (flex horizontal, 100vh)
├── <app-sidebar [collapsed]="sidebarCollapsed()">
└── .content-area (flex vertical, flex:1)
    ├── <app-header (toggleSidebar)="toggleSidebar()">
    ├── <main class="main-content"> (overflow:auto, bg:#f5f7fb)
    │   └── <router-outlet />
    └── <app-notification-toast />
```

### State

- `sidebarCollapsed: WritableSignal<boolean>` — toggle con `toggleSidebar()`

## SidebarComponent

Barra lateral colapsable con navegacion.

### Input

- `collapsed: InputSignal<boolean>` — controla ancho 240px vs 64px

### Navegacion

Array `navItems` hardcodeado:

```typescript
[
  { label: 'Panel', icon: 'dashboard', route: '/dashboard' },
  { label: 'Writing Solver', icon: 'edit_note', route: '/writing-solver' },
]
```

Link fijo en la parte inferior: Configuracion → `/settings`

### Visual

- Fondo: `#da6ccf` (rosa)
- Texto blanco, hover con fondo semi-transparente
- Logo "MI APP" (texto) o icono `hub` (colapsado)
- Transicion de ancho 0.3s

## HeaderComponent

Barra superior con controles globales.

### Output

- `toggleSidebar: OutputSignal<void>` — emite al hacer click en boton menu

### Funcionalidad

1. **Boton menu** — emite `toggleSidebar`
2. **Campana de notificaciones** — badge con count, dropdown con lista de notificaciones
3. **Menu de usuario** — nombre, roles, link a settings, boton logout

### Dependencias inyectadas

- `AuthService` — para `currentUser()` y `logout()`
- `NotificationService` — para `notifications()` y `dismiss()`
