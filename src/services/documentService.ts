import axios from 'axios';
import { SaveDocumentRequest, SaveDocumentResponse, LoadDocumentResponse, CanvasImage, SerializedCanvasImage } from '../types';
import { extractErrorMessage } from '../utils/errorUtils';

/**
 * DocumentService - Service class for handling canvas document persistence and sharing
 * 
 * @class DocumentService
 * 
 * @description Provides static methods for saving, loading, and managing canvas documents.
 * Handles serialization/deserialization of canvas images, document persistence via API,
 * and URL generation for sharing. Acts as the data layer for document operations.
 * 
 * @example
 * // Save a new document
 * const result = await DocumentService.saveDocument("My Canvas", images);
 * if (result.success) {
 *   const shareUrl = DocumentService.generateShareUrl(result.documentId);
 * }
 * 
 * // Load an existing document
 * const loadResult = await DocumentService.loadDocument(documentId);
 * if (loadResult.success) {
 *   const images = DocumentService.deserializeImages(loadResult.document.images);
 * }
 */
export class DocumentService {
  /**
   * Save a new canvas document to the database
   * 
   * @param {string | undefined} title - Optional title for the document
   * @param {CanvasImage[]} images - Array of canvas images to save
   * @returns {Promise<SaveDocumentResponse>} Response containing document ID or error
   * 
   * @description Saves a new canvas document by serializing the images array and
   * sending it to the backend API. Removes UI-specific properties before saving.
   * 
   * @example
   * const result = await DocumentService.saveDocument(
   *   "Beautiful Landscapes",
   *   canvasImages
   * );
   * 
   * if (result.success) {
   *   console.log("Document saved with ID:", result.documentId);
   * } else {
   *   console.error("Save failed:", result.error);
   * }
   */
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

  /**
   * Load an existing canvas document from the database
   * 
   * @param {string} documentId - UUID of the document to load
   * @returns {Promise<LoadDocumentResponse>} Response containing document data or error
   * 
   * @description Loads a canvas document from the backend API using its ID.
   * Returns the document with serialized image data that needs to be deserialized.
   * 
   * @example
   * const result = await DocumentService.loadDocument(
   *   "123e4567-e89b-12d3-a456-426614174000"
   * );
   * 
   * if (result.success) {
   *   const images = DocumentService.deserializeImages(result.document.images);
   *   console.log("Loaded document:", result.document.title);
   * } else {
   *   console.error("Load failed:", result.error);
   * }
   */
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

  /**
   * Deserialize loaded images back to CanvasImage format
   * 
   * @param {SerializedCanvasImage[]} serializedImages - Array of serialized image data from database
   * @returns {CanvasImage[]} Array of canvas images with UI state reset
   * 
   * @description Converts serialized image data from the database back into the
   * CanvasImage format used by the frontend. Resets UI-specific properties like
   * selection state and sets initial loading state.
   * 
   * @example
   * const serializedImages = loadResult.document.images;
   * const canvasImages = DocumentService.deserializeImages(serializedImages);
   * setImages(canvasImages);
   */
  static deserializeImages(serializedImages: SerializedCanvasImage[]): CanvasImage[] {
    return serializedImages.map(img => ({
      ...img,
      src: '', // Initially no src so it shows loading placeholder
      selected: false, // Reset UI state
      displayState: 'loading' as const, // Set to loading state initially
    }));
  }

  /**
   * Update an existing canvas document in the database
   * 
   * @param {string} documentId - UUID of the document to update
   * @param {string | undefined} title - Optional updated title for the document
   * @param {CanvasImage[]} images - Updated array of canvas images
   * @returns {Promise<SaveDocumentResponse>} Response containing document ID or error
   * 
   * @description Updates an existing canvas document by serializing the current
   * images array and sending it to the backend API. Maintains the same document ID.
   * 
   * @example
   * const result = await DocumentService.updateDocument(
   *   existingDocumentId,
   *   "Updated Title",
   *   updatedImages
   * );
   * 
   * if (result.success) {
   *   console.log("Document updated successfully");
   * } else {
   *   console.error("Update failed:", result.error);
   * }
   */
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

  /**
   * Generate a shareable URL for a canvas document
   * 
   * @param {string} documentId - UUID of the document to share
   * @param {string} [baseUrl] - Optional base URL (defaults to current origin)
   * @returns {string} Complete shareable URL for the document
   * 
   * @description Creates a shareable URL that can be used to load a specific
   * canvas document. The URL includes the document ID as a query parameter.
   * 
   * @example
   * const shareUrl = DocumentService.generateShareUrl(documentId);
   * // Returns: "https://myapp.com/?doc=123e4567-e89b-12d3-a456-426614174000"
   * 
   * // With custom base URL
   * const shareUrl = DocumentService.generateShareUrl(
   *   documentId,
   *   "https://custom-domain.com"
   * );
   */
  static generateShareUrl(documentId: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/?doc=${documentId}`;
  }
} 