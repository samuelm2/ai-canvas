import { useCallback, useState } from 'react';
import { DocumentService } from '../services/documentService';
import { CanvasImage } from '../types';

interface UseDocumentOperationsProps {
  images: CanvasImage[];
  setImages: (images: CanvasImage[]) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export function useDocumentOperations({
  images,
  setImages,
  setError,
  clearAll,
}: UseDocumentOperationsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSavedDocumentId, setLastSavedDocumentId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Save current canvas as a document
  const saveDocument = useCallback(async (title?: string) => {
    if (images.length === 0) {
      setError('Cannot save empty canvas');
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await DocumentService.saveDocument(title, images);
      
      if (result.success && result.documentId && result.shareUrl) {
        setLastSavedDocumentId(result.documentId);
        setShareUrl(result.shareUrl);
        return {
          documentId: result.documentId,
          shareUrl: result.shareUrl,
        };
      } else {
        setError(result.error || 'Failed to save document');
        return null;
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Failed to save document');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [images, setError]);

  // Load a document by ID
  const loadDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await DocumentService.loadDocument(documentId);
      
      if (result.success && result.document) {
        // Clear current canvas first
        clearAll();
        
        // Deserialize and load images
        const deserializedImages = DocumentService.deserializeImages(result.document.images);
        setImages(deserializedImages);
        
        setLastSavedDocumentId(documentId);
        return result.document;
      } else {
        setError(result.error || 'Failed to load document');
        return null;
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setImages, setError, clearAll]);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return false;

    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
      return false;
    }
  }, [shareUrl]);

  // Reset document state
  const resetDocumentState = useCallback(() => {
    setLastSavedDocumentId(null);
    setShareUrl(null);
  }, []);

  return {
    // State
    isSaving,
    isLoading,
    lastSavedDocumentId,
    shareUrl,
    
    // Operations
    saveDocument,
    loadDocument,
    copyShareUrl,
    resetDocumentState,
  };
} 