import { useState, useCallback } from 'react';
import { CanvasImage } from '../types';

/**
 * useCanvasState - Base state management hook for the image canvas
 * 
 * @returns {Object} Canvas state and basic operations
 * 
 * @description Provides the fundamental state management for the AI image canvas.
 * This hook manages the core state including images array, selected image,
 * current prompt, organization state, and error handling. It provides basic
 * CRUD operations for images and selection management.
 * 
 * @example
 * const {
 *   images, selectedImage, currentPrompt, error,
 *   addImage, updateImage, deleteImage, selectImage, clearAll
 * } = useCanvasState();
 * 
 * @returns {Object} Object containing:
 * - **State**: images, selectedImageId, selectedImage, currentPrompt, isOrganizing, error
 * - **Setters**: setImages, setCurrentPrompt, setIsOrganizing, setErrorModal
 * - **Operations**: addImage, updateImage, deleteImage, selectImage, clearAll, dismissError
 */
export function useCanvasState() {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [error, setErrorModal] = useState<string | null>(null);

  // Computed values
  const selectedImage = images.find(img => img.id === selectedImageId);

  // Basic state operations
  const addImage = useCallback((image: CanvasImage) => {
    setImages(prev => [...prev, image]);
  }, []);

  const updateImage = useCallback((id: string, updates: Partial<CanvasImage>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const deleteImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
      setCurrentPrompt('');
    }
  }, [selectedImageId]);

  const selectImage = useCallback((id: string | null) => {
    setSelectedImageId(id);
    setImages(prev => prev.map(img => 
      ({ ...img, selected: img.id === id })
    ));
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setSelectedImageId(null);
    setCurrentPrompt('');
    setErrorModal(null);
  }, []);

  const dismissError = useCallback(() => {
    setErrorModal(null);
  }, []);

  return {
    // State
    images,
    selectedImageId,
    selectedImage,
    currentPrompt,
    isOrganizing,
    error,
    
    // Setters
    setImages,
    setCurrentPrompt,
    setIsOrganizing,
    setErrorModal,
    
    // Operations
    addImage,
    updateImage,
    deleteImage,
    selectImage,
    clearAll,
    dismissError,
  };
} 