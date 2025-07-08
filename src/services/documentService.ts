import axios from 'axios';
import { SaveDocumentRequest, SaveDocumentResponse, LoadDocumentResponse, CanvasImage } from '../types';

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
        // Exclude selected, loadingState as these are UI-only
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
        shareUrl: response.data.shareUrl,
      };
    } catch (error: any) {
      console.error('Error saving document:', error);
      
      let errorMessage = 'Failed to save document';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

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
    } catch (error: any) {
      console.error('Error loading document:', error);
      
      let errorMessage = 'Failed to load document';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Utility function to deserialize loaded images back to CanvasImage format
  static deserializeImages(serializedImages: any[]): CanvasImage[] {
    return serializedImages.map(img => ({
      ...img,
      selected: false, // Reset UI state
      loadingState: 'finished' as const, // Reset loading state
      zIndex: img.zIndex || 1, // Ensure zIndex exists
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
        // Exclude selected, loadingState as these are UI-only
      }));

      const requestData = {
        title,
        images: serializedImages,
      };

      const response = await axios.put(`/api/documents/${documentId}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Generate the same share URL since document ID doesn't change
      const shareUrl = this.generateShareUrl(documentId);

      return {
        success: true,
        documentId,
        shareUrl,
      };
    } catch (error: any) {
      console.error('Error updating document:', error);
      
      let errorMessage = 'Failed to update document';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

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