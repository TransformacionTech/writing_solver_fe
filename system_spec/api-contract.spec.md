# Spec: API Contract

## Base URL

- Dev: `https://localhost:7018`
- Prod: `/api`

## Endpoints

### POST `/pipeline/run`

Genera un post de LinkedIn via pipeline multi-agente.

**Request:**
```json
{ "tema": "string" }
```

**Response:** SSE stream. Cada linea tiene formato `data: {json}\n\n`

**Eventos SSE:**

| type | data | Descripcion |
|------|------|-------------|
| `FASE1_INICIO` | `{}` | Inicia fase 1: Research + Writer |
| `FASE1_COMPLETA` | `{}` | Fase 1 terminada |
| `FASE2_INTENTO` | `{ intento: number, max: number }` | Intento N de M en fase 2 (Editor + Evaluador) |
| `FASE2_EVALUACION` | `{}` | Evaluacion del intento |
| `PIPELINE_COMPLETO` | `{ post: string, log: string[] }` | Post final aprobado (score >= 8/10) |
| `PIPELINE_ERROR` | `{ fase: number, error: string }` | Error en el pipeline |

**Headers requeridos:** `Authorization: Bearer {token}`, `Content-Type: application/json`

---

### POST `/pipeline/suggest-topics`

Genera 5 sugerencias de temas para posts.

**Request:** `{}` (body vacio)

**Response:** SSE stream.

**Evento final esperado:**
```json
{ "type": "PIPELINE_COMPLETO", "data": { "ideas": "string (markdown)" } }
```

---

### POST `/pipeline/chat`

Chat libre sobre un post ya generado. NO es streaming.

**Request:**
```json
{
  "mensaje": "string",
  "post_actual": "string",
  "history": [{ "role": "user|assistant", "content": "string" }]
}
```

**Response:**
```json
{
  "respuesta": "string",
  "post_modificado": boolean
}
```

---

### POST `/pipeline/update-rag`

Re-indexa documentos de referencia en la base vectorial.

**Request:** `{}` (body vacio)

**Response:**
```json
{
  "success": boolean,
  "output": "string"
}
```

---

### POST `/pipeline/upload-rag`

Sube un archivo de referencia (post anterior, guia de estilo) para alimentar ChromaDB.

**Content-Type:** `multipart/form-data`

**Campo:** `file` (acepta `.pdf` y `.txt`)

**Headers requeridos:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "status": "ok",
  "filename": "guia-estilo.pdf",
  "chunks_stored": 5,
  "document_ids": ["doc-abc-1", "doc-abc-2"]
}
```

**Validacion client-side:** El frontend rechaza extensiones distintas a `.pdf` y `.txt` antes de enviar.

**Nota:** Se usa `HttpClient` con `FormData` (no fetch nativo) porque no es streaming.

---

## Autenticacion

- Todas las requests incluyen header `Authorization: Bearer {token}` via `authInterceptor`
- Token generado en mock login: `mock-jwt-{userId}-{timestamp}`
- Backend real deberia validar JWT

## Manejo de errores HTTP

| Status | Accion del frontend |
|--------|---------------------|
| 401 | `logout()` + redirect a `/auth/login` |
| 403 | Redirect a `/forbidden` |
| Otros | Re-lanza error para manejo en componente |

## SSE: Implementacion en el frontend

El servicio usa `fetch()` nativo (no `HttpClient`) para SSE porque Angular HttpClient no soporta streaming de texto.

Flujo:
1. `fetch(url, { method: 'POST', headers, body })`
2. `response.body.getReader()` para obtener stream
3. `TextDecoder` para decodificar chunks
4. Buffer de lineas, parseo de `data: {json}`
5. `NgZone.run()` para disparar change detection
6. Envuelto en `Observable` para integracion con RxJS

## WebSocket

Configurado en environment (`wsUrl`) pero **no se usa actualmente**. Reservado para futuras funcionalidades.
