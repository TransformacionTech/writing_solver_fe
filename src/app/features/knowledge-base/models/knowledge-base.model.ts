export interface RagUploadResponse {
  status: string;
  filename: string;
  chunks_stored: number;
  document_ids: string[];
}

export interface UploadedFile {
  filename: string;
  chunks: number;
  documentIds: string[];
  uploadedAt: string;
}
