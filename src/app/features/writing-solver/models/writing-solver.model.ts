export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type PipelineEventType =
  | 'FASE1_INICIO'
  | 'FASE1_COMPLETA'
  | 'FASE2_INTENTO'
  | 'FASE2_EVALUACION'
  | 'PIPELINE_COMPLETO'
  | 'PIPELINE_ERROR';

export interface PipelineEvent {
  type: PipelineEventType;
  data: Record<string, unknown>;
}

export interface Fase2Data {
  intento: number;
  max: number;
}

export interface PipelineCompletoData {
  post: string;
  log: string[];
}

export interface PipelineErrorData {
  fase: number;
  error: string;
}

export interface ChatResponse {
  respuesta: string;
  post_modificado: boolean;
}

export interface TopicSuggestionResponse {
  ideas: string;
}

export interface RagUpdateResponse {
  success: boolean;
  output: string;
}
