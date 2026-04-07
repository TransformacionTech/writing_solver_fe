# System Spec Index

Mapa de specs por dominio. Cada archivo contiene la especificacion completa de su area.
El agente debe cargar **solo** el spec relevante a la tarea en curso.

| Spec | Archivo | Area | Cuando cargar |
|------|---------|------|---------------|
| App Shell | [app-shell.spec.md](app-shell.spec.md) | Bootstrap, config, rutas, environments | Cambios en rutas, providers, config global |
| Auth | [auth.spec.md](auth.spec.md) | Login, guards, interceptors, sesion | Cambios en autenticacion, permisos, tokens |
| Layout | [layout.spec.md](layout.spec.md) | Sidebar, header, main-layout | Cambios en navegacion, shell visual, menus |
| Writing Solver | [writing-solver.spec.md](writing-solver.spec.md) | Pipeline, chat, topics, RAG | Cambios en la feature principal |
| Shared | [shared.spec.md](shared.spec.md) | Modelos, componentes reutilizables, notificaciones | Crear/modificar componentes compartidos |
| API Contract | [api-contract.spec.md](api-contract.spec.md) | Endpoints, payloads, SSE events | Integrar con backend, cambiar llamadas HTTP |
| Knowledge Base | [knowledge-base.spec.md](knowledge-base.spec.md) | Upload RAG, drag-drop, historial archivos | Cambios en subida de archivos o base de conocimiento |
| Conventions | [conventions.spec.md](conventions.spec.md) | Patrones, reglas de codigo, estructura | Crear nuevos features o componentes |
