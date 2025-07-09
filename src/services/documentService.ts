import axios, { isAxiosError } from 'axios';
import { SaveDocumentRequest, SaveDocumentResponse, LoadDocumentResponse, CanvasImage, SerializedCanvasImage } from '../types';
import { extractErrorMessage } from '../utils/errorUtils';

export class DocumentService {
  static async saveDocument(title: string | undefined, images: CanvasImage[]): Promise<SaveDocumentResponse> {
    try {
      // Serialize images, removing UI-specific properties
      const serializedImages = images.map(img => ({
        id: img.id,
        src: img.src,
        x: img.x,
        y: img.y,
        width: img.width,
        height: img.height,
        prompt: img.prompt,
        zIndex: img.zIndex || 1,
        // Exclude selected, displayState as these are UI-only
      }));

      const requestData: SaveDocumentRequest = {
        title,
        images: serializedImages,
      };

      const response = await axios.post('/api/documents', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        documentId: response.data.documentId,
      };
    } catch (error: unknown) {
      console.error('Error saving document:', error);
      
      const errorMessage = extractErrorMessage(error, 'Failed to save document');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  static async loadDocument(documentId: string): Promise<LoadDocumentResponse> {
    try {
      const response = await axios.get(`/api/documents/${documentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        document: response.data.document,
      };
    } catch (error: unknown) {
      console.error('Error loading document:', error);
      
      const errorMessage = extractErrorMessage(error, 'Failed to load document');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

    // Utility function to deserialize loaded images back to CanvasImage format
  static deserializeImages(serializedImages: SerializedCanvasImage[]): CanvasImage[] {
    return serializedImages.map(img => ({
      ...img,
      src: '', // Initially no src so it shows loading placeholder
      selected: false, // Reset UI state
      displayState: 'loading' as const, // Set to loading state initially
    }));
  }

  static async updateDocument(documentId: string, title: string | undefined, images: CanvasImage[]): Promise<SaveDocumentResponse> {
    try {
      // Serialize images, removing UI-specific properties
      const serializedImages = images.map(img => ({
        id: img.id,
        src: img.src,
        x: img.x,
        y: img.y,
        width: img.width,
        height: img.height,
        prompt: img.prompt,
        zIndex: img.zIndex || 1,
        // Exclude selected, displayState as these are UI-only
      }));

      const requestData = {
        title,
        images: serializedImages,
      };

      await axios.put(`/api/documents/${documentId}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        documentId,
      };
    } catch (error: unknown) {
      console.error('Error updating document:', error);
      
      const errorMessage = extractErrorMessage(error, 'Failed to update document');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Utility function to generate a shareable URL
  static generateShareUrl(documentId: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/?doc=${documentId}`;
  }
} 