# Writing Solver — Frontend

UI del sistema multi-agente de posts LinkedIn para Tech And Solve.

## Ramas

| Rama | Uso | URL |
|---|---|---|
| `main` | Desarrollo local | `http://localhost:4200` |
| `deploy` | Produccion en Render | `https://writing-solver-fe.onrender.com` |

Desarrollar en `main`. Merge a `deploy` para desplegar a produccion.

## Correr localmente (rama `main`)

Requiere el backend corriendo en `http://localhost:8000`.

```bash
npm install
npm start        # http://localhost:4200
```

El proxy de Angular reenvía `/pipeline` y `/auth` al backend local automaticamente.

## Build de produccion (rama `deploy`)

Render ejecuta esto automaticamente al hacer push a `deploy`:

```bash
npm install && npm run build
```

Output: `dist/writing-solver-fe/browser/`

## Tests

```bash
npm test
```

## Stack

Angular 21.2 | Angular Material 21.2 | TypeScript 5.9 | RxJS 7.8
