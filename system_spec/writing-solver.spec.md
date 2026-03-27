# Spec: Writing Solver

## Archivos

- `src/app/features/writing-solver/writing-solver.component.ts|html`
- `src/app/features/writing-solver/services/writing-solver.service.ts`
- `src/app/features/writing-solver/models/writing-solver.model.ts`

## Proposito

Feature principal. Interfaz de chat para generar posts de LinkedIn mediante un pipeline multi-agente (Researcher → Writer → Editor → Reader). Toda la logica de agentes vive en el backend; este modulo solo consume la API.

## Modelos

```typescript
ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: Date }

PipelineEventType =
  'FASE1_INICIO' | 'FASE1_COMPLETA' |
  'FASE2_INTENTO' | 'FASE2_EVALUACION' |
  'PIPELINE_COMPLETO' | 'PIPELINE_ERROR'

PipelineEvent { type: PipelineEventType; data: Record<string, unknown> }
Fase2Data { intento: number; max: number }
PipelineCompletoData { post: string; log: string[] }
PipelineErrorData { fase: number; error: string }
ChatResponse { respuesta: string; post_modificado: boolean }
TopicSuggestionResponse { ideas: string }
RagUpdateResponse { success: boolean; output: string }
```

## WritingSolverService

Extiende `BaseApiService`. Base path: `{apiUrl}/pipeline/`

| Metodo | HTTP | Endpoint | Body | Retorno | Streaming |
|--------|------|----------|------|---------|-----------|
| `runPipeline(tema)` | POST | `/pipeline/run` | `{ tema }` | `Observable<PipelineEvent>` | SSE |
| `suggestTopics()` | POST | `/pipeline/suggest-topics` | `{}` | `Observable<PipelineEvent>` | SSE |
| `chatAboutPost(msg, post, history)` | POST | `/pipeline/chat` | `{ mensaje, post_actual, history }` | `Observable<ChatResponse>` | No |
| `updateRag()` | POST | `/pipeline/update-rag` | `{}` | `Observable<RagUpdateResponse>` | No |

### Implementacion SSE

- Usa `fetch()` nativo (no HttpClient) para streaming
- Lee `response.body.getReader()` con `TextDecoder`
- Parsea lineas `data: {json}` manualmente
- Envuelve todo en `Observable` con `NgZone.run()` para change detection

## WritingSolverComponent

### Signals

| Signal | Tipo | Descripcion |
|--------|------|-------------|
| `messages` | `WritableSignal<ChatMessage[]>` | Historial del chat |
| `inputText` | `WritableSignal<string>` | Texto del input |
| `isProcessing` | `WritableSignal<boolean>` | Pipeline en ejecucion |

### Estado privado

- `postState: string` — ultimo post generado, se envia como contexto en chat

### Flujo de entrada del usuario

`send()` detecta la intencion del texto:

| Patron regex | Accion |
|--------------|--------|
| `/sugi?er[ea]\s+temas?/i` o `/temas?\s+trending/i` | `suggestTopics()` |
| `/crea\s+un\s+post\s+(?:sobre\s+)?(.+)/i` | `runPipeline(tema)` — extrae tema del capture group |
| Cualquier otro texto (si hay postState) | `chatAboutPost(mensaje)` |

### Eventos SSE del pipeline

| Evento | Accion en UI |
|--------|-------------|
| `FASE1_INICIO` | Muestra mensaje "Fase 1 en curso" |
| `FASE2_INTENTO` | Muestra "Intento N de M" |
| `PIPELINE_COMPLETO` | Muestra post final + log, guarda en `postState` |
| `PIPELINE_ERROR` | Muestra error, notificacion toast |

### Prompts de ejemplo (hardcoded)

1. "Crea un post sobre modernizacion de sistemas legacy en aseguradoras"
2. "Crea un post sobre DevOps para aseguradoras en LATAM"
3. "Crea un post sobre seguros embebidos"

### Template

- Header con botones "Sugerir temas" y "Actualizar DB"
- Estado vacio con bienvenida y chips de ejemplo
- Chat con mensajes user/assistant renderizados con `ngx-markdown`
- Input con boton Send, deshabilitado durante procesamiento
- Auto-scroll al fondo via `AfterViewChecked`
