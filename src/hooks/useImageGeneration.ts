import { useRef, useCallback, useEffect } from 'react';
import { CanvasImage } from '../types';
import { AIService } from '../services/aiService';

interface UseImageGenerationProps {
  updateImage: (id: string, updates: Partial<CanvasImage>) => void;
  setError: (error: string | null) => void;
}

export function useImageGeneration({ updateImage, setError }: UseImageGenerationProps) {
  const activeRequestsRef = useRef<Map<string, AbortController>>(new Map());

  // Helper function to preload an image
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  // Cancel any active request for a tile
  const cancelActiveRequest = useCallback((tileId: string) => {
    const activeController = activeRequestsRef.current.get(tileId);
    if (activeController) {
      activeController.abort();
      activeRequestsRef.current.delete(tileId);
    }
  }, []);

  // Generate image for a specific tile
  const generateImageForTile = useCallback(async (tileId: string, prompt: string) => {
    if (!prompt?.trim()) {
      setError('Cannot generate image with empty prompt');
      return;
    }
    
    cancelActiveRequest(tileId);
    
    const abortController = new AbortController();
    activeRequestsRef.current.set(tileId, abortController);
    
    try {
      const result = await AIService.generateImage(prompt, abortController.signal);
      activeRequestsRef.current.delete(tileId);
      
      if (result.success && result.imageUrl) {
        updateImage(tileId, { loadingState: 'urlLoading' });
        
        try {
          await preloadImage(result.imageUrl);
          updateImage(tileId, { 
            src: result.imageUrl, 
            loadingState: 'finished' 
          });
        } catch {
          setError('Failed to load image');
          updateImage(tileId, { loadingState: 'finished' });
        }
      } else if (result.error !== 'Request cancelled') {
        setError(result.error || 'Failed to generate image');
        updateImage(tileId, { loadingState: 'finished' });
      }
    } catch (err: any) {
      activeRequestsRef.current.delete(tileId);
      
      if (err.name !== 'AbortError') {
        setError('Network error occurred');
        updateImage(tileId, { loadingState: 'finished' });
      }
    }
  }, [updateImage, setError, cancelActiveRequest]);

  // Generate prompt variations for image expansion
  const generatePromptVariations = useCallback(async (prompt: string) => {
    try {
      const result = await AIService.generatePromptVariations(prompt);
      return result;
    } catch (error) {
      console.error('Error generating prompt variations:', error);
      throw error;
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    activeRequestsRef.current.forEach(controller => controller.abort());
    activeRequestsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    generateImageForTile,
    generatePromptVariations,
    cancelActiveRequest,
    cleanup,
  };
} 