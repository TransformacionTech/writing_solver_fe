# Spec: Knowledge Base (RAG Upload)

## Proposito

Permite subir archivos de referencia (.pdf, .txt) para alimentar ChromaDB y que los agentes editores adopten el tono y formato del usuario.

## Archivos

- `src/app/features/knowledge-base/knowledge-base.component.ts|html`
- `src/app/features/knowledge-base/services/knowledge-base.service.ts`
- `src/app/features/knowledge-base/models/knowledge-base.model.ts`

## Modelos

```typescript
RagUploadResponse {
  status: string;
  filename: string;
  chunks_stored: number;
  document_ids: string[];
}

UploadedFile {
  filename: string;
  chunks: number;
  documentIds: string[];
  uploadedAt: string;   // ISO date
}
```

## KnowledgeBaseService

Singleton (`providedIn: 'root'`). Usa `HttpClient` para multipart upload.

| Metodo | Retorno | Descripcion |
|--------|---------|-------------|
| `uploadFile(file)` | `Observable<RagUploadResponse>` | POST multipart a `/pipeline/upload-rag` |
| `validateFile(file)` | `string \| null` | Valida extension (.pdf, .txt). Retorna mensaje de error o null |
| `addToHistory(response)` | `void` | Agrega archivo al historial y persiste en localStorage |
| `removeFromHistory(index)` | `void` | Elimina archivo del historial |

### Signals

- `uploadedFiles: WritableSignal<UploadedFile[]>` — lista persistida en localStorage bajo key `rag_uploaded_files`

## KnowledgeBaseComponent

### Signals

| Signal | Tipo | Descripcion |
|--------|------|-------------|
| `isUploading` | `WritableSignal<boolean>` | Upload en curso |
| `uploadingFilename` | `WritableSignal<string>` | Nombre del archivo subiendo |
| `isDragOver` | `WritableSignal<boolean>` | Drag activo sobre zona |
| `validationError` | `WritableSignal<string>` | Error de validacion |

### Funcionalidad

1. **Zona drag & drop** + boton "Seleccionar archivo"
2. **Validacion client-side**: solo `.pdf` y `.txt`, muestra error inline si falla
3. **Progreso**: `mat-progress-bar` indeterminate durante upload
4. **Toast**: al completar muestra nombre + cantidad de chunks
5. **Lista de archivos**: desde localStorage, con nombre, chunks, fecha, boton eliminar

### Ruta

`/knowledge-base` — lazy-loaded, protegida con `authGuard`

### Sidebar

Item: `{ label: 'Base de Conocimiento', icon: 'menu_book', route: '/knowledge-base' }`

## Restricciones

- El frontend NO procesa los archivos, solo los envia al backend
- La persistencia de la lista es solo visual (localStorage), el backend es la fuente de verdad
- No hay limite de tamano en el frontend (el backend puede rechazar archivos grandes)
