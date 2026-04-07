export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Evento SSE del pipeline /pipeline/run */
export interface PipelineEvent {
  type: 'progress' | 'result' | 'done';
  agent?: string;
  message?: string;
  post?: string;
  score?: number;
}

/** Respuesta de POST /pipeline/chat */
export interface ChatResponse {
  respuesta: string;
  post_modificado: boolean;
}

/** Respuesta de GET /pipeline/suggest-topics */
export interface SuggestTopicsResponse {
  topics: string[];
}

/** Respuesta de POST /pipeline/upload-rag */
export interface RagUploadResponse {
  status: string;
  filename: string;
  chunks_stored: number;
  document_ids: string[];
}

/** Respuesta de POST /pipeline/update-rag */
export interface RagUpdateResponse {
  status: string;
  document_id: string;
}
