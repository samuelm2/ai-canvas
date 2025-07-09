export type ImageDisplayState = 'loading' | 'updating' | 'ready';

export interface CanvasImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt?: string;
  selected?: boolean;
  displayState?: ImageDisplayState;
  zIndex?: number;
}

export interface SerializedCanvasImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt?: string;
  zIndex: number;
}

export interface GridConfig {
  gap: number;
  startX: number;
  startY: number;
}

export interface AIImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface CanvasDocument {
  id: string;
  title?: string;
  images: SerializedCanvasImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveDocumentRequest {
  title?: string;
  images: CanvasImage[];
}

export interface SaveDocumentResponse {
  success: boolean;
  documentId?: string;
  shareUrl?: string;
  error?: string;
}

export interface LoadDocumentResponse {
  success: boolean;
  document?: CanvasDocument;
  error?: string;
}

export interface PromptVariationsResponse {
  success: boolean;
  variations?: string[];
  error?: string;
}

export type FileMenuStatus = 'idle' | 'saving' | 'savingNewCopy' | 'saved' | 'copied'; 