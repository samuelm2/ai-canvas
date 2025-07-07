export interface CanvasImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt?: string;
}

export interface GridConfig {
  columns: number;
  gap: number;
  startX: number;
  startY: number;
}

export interface AIImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
} 