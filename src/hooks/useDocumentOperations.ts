import { useCallback, useState, useRef, useEffect } from 'react';
import { DocumentService } from '../services/documentService';
import { CanvasImage, FileMenuStatus } from '../types';

/**
 * Props for the useDocumentOperations hook
 * 
 * @interface UseDocumentOperationsProps
 * @property {CanvasImage[]} images - Array of canvas images to save/load
 * @property {function} setImages - Function to update the images array
 * @property {function} setError - Function to set error messages
 * @property {function} clearAll - Function to clear all canvas state
 * @property {function} updateImage - Function to update image properties
 * @property {function} preloadImage - Function to preload an image URL
 */
interface UseDocumentOperationsProps {
  images: CanvasImage[];
  setImages: (images: CanvasImage[]) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
  updateImage: (id: string, updates: Partial<CanvasImage>) => void;
  preloadImage: (url: string) => Promise<void>;
}

/**
 * useDocumentOperations - Hook for managing document persistence and sharing
 * 
 * @param {UseDocumentOperationsProps} props - Hook configuration
 * @returns {Object} Document operation functions and state
 * 
 * @description Provides comprehensive functionality for saving, loading, and
 * sharing canvas documents. Manages document state, file operations status,
 * URL generation for sharing, and proper cleanup of resources.
 * 
 * @example
 * const {
 *   saveDocument,
 *   loadDocument,
 *   copyShareUrl,
 *   fileMenuStatus,
 *   shareUrl,
 *   lastSavedDocumentId,
 *   isLoading
 * } = useDocumentOperations({
 *   images,
 *   setImages,
 *   setError,
 *   clearAll,
 *   updateImage,
 *   preloadImage
 * });
 * 
 * @returns {Object} Object containing:
 * - **saveDocument**: Function to save the canvas as a document
 * - **loadDocument**: Function to load a document by ID
 * - **copyShareUrl**: Function to copy share URL to clipboard
 * - **resetDocumentState**: Function to reset document state
 * - **fileMenuStatus**: Current status of file operations
 * - **isLoading**: Whether a document is currently loading
 * - **lastSavedDocumentId**: ID of the last saved document
 * - **shareUrl**: URL for sharing the current document
 */
export function useDocumentOperations({
  images,
  setImages,
  setError,
  clearAll,
  updateImage,
  preloadImage,
}: UseDocumentOperationsProps) {
  const [fileMenuStatus, setFileMenuStatus] = useState<FileMenuStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSavedDocumentId, setLastSavedDocumentId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save or update current canvas as a document
  const saveDocument = useCallback(async (title?: string, forceNew: boolean = false) => {
    if (images.length === 0) {
      setError('Cannot save empty canvas');
      return null;
    }

    // Prevent multiple simultaneous saves
    if (fileMenuStatus !== 'idle' && fileMenuStatus !== 'saved') {
      return null;
    }

    // Clear any existing "saved" timeout
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = null;
    }

    // Set the appropriate loading state
    setFileMenuStatus(forceNew ? 'savingNewCopy' : 'saving');
    setError(null);

    try {
      let result;
      
      if (lastSavedDocumentId && !forceNew) {
        // Update existing document
        result = await DocumentService.updateDocument(lastSavedDocumentId, title, images);
      } else {
        // Create new document (either first save or forced new copy)
        result = await DocumentService.saveDocument(title, images);
      }
      
      if (result.success && result.documentId) {
        // Always update to track the current document (whether updated or new)
        setLastSavedDocumentId(result.documentId);
        
        // Generate shareUrl dynamically
        const generatedShareUrl = DocumentService.generateShareUrl(result.documentId);
        setShareUrl(generatedShareUrl);
        
        // Update URL parameter when saving a new copy
        if (forceNew || !lastSavedDocumentId) {
          const newUrl = `${window.location.pathname}?doc=${result.documentId}`;
          window.history.replaceState(null, '', newUrl);
        }
        
        // Set saved state and schedule transition back to idle
        setFileMenuStatus('saved');
        savedTimeoutRef.current = setTimeout(() => {
          setFileMenuStatus('idle');
          savedTimeoutRef.current = null;
        }, 2000);
        
        return {
          documentId: result.documentId,
          shareUrl: generatedShareUrl,
        };
      } else {
        setError(result.error || 'Failed to save document');
        setFileMenuStatus('idle');
        return null;
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Failed to save document');
      setFileMenuStatus('idle');
      return null;
    }
  }, [images, lastSavedDocumentId, setError, fileMenuStatus]);

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
        
        // Preload all images and update their loading states
        await Promise.all(result.document.images.map(async (originalImage: Partial<CanvasImage>, index: number) => {
          const deserializedImage = deserializedImages[index];
          if (originalImage.src) {
            try {
              await preloadImage(originalImage.src);
              updateImage(deserializedImage.id, { 
                src: originalImage.src, 
                displayState: 'ready' 
              });
            } catch (error) {
              console.error('Failed to preload image:', error);
              updateImage(deserializedImage.id, { 
                displayState: 'failed'
              });
            }
          }
        }));
        
        setLastSavedDocumentId(documentId);
        
        // Set share URL for existing document
        const shareUrl = DocumentService.generateShareUrl(documentId);
        setShareUrl(shareUrl);
        
        // Update URL parameter to reflect the loaded document
        const newUrl = `${window.location.pathname}?doc=${documentId}`;
        window.history.replaceState(null, '', newUrl);
        
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
  }, [setImages, setError, clearAll, updateImage, preloadImage]);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return false;

    try {
      await navigator.clipboard.writeText(shareUrl);
      
      // Clear any existing timeout
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = null;
      }
      
      // Set copied state and schedule transition back to idle
      setFileMenuStatus('copied');
      savedTimeoutRef.current = setTimeout(() => {
        setFileMenuStatus('idle');
        savedTimeoutRef.current = null;
      }, 2000);
      
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
    setFileMenuStatus('idle');
    
    // Clear any existing "saved" timeout
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = null;
    }
    
    // Clear URL parameter when resetting document state
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    fileMenuStatus,
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