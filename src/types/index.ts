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

// Serialized image for database storage (without UI-specific properties)
export interface SerializedImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt?: string;
  zIndex?: number;
}

// Database document structure (with string timestamps)
export interface DatabaseDocument {
  id: string;
  title: string;
  images: SerializedImage[];
  createdAt: string;
  updatedAt: string;
}

// Common axios error structure
export interface AxiosErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
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

export interface AIPromptVariationsResponse {
  success: boolean;
  variations?: string[];
  error?: string;
}

export interface CanvasDocument {
  id: string;
  title?: string;
  images: CanvasImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveDocumentRequest {
  title?: string;
  images: SerializedImage[];
}

export interface SaveDocumentResponse {
  success: boolean;
  documentId?: string;
  shareUrl?: string;
  error?: string;
}

export interface LoadDocumentResponse {
  success: boolean;
  document?: DatabaseDocument;
  error?: string;
}

export type FileMenuStatus = 'idle' | 'saving' | 'savingNewCopy' | 'saved' | 'copied'; 