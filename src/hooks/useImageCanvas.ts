import { useCanvasState } from './useCanvasState';
import { useImageGeneration } from './useImageGeneration';
import { useImageOperations } from './useImageOperations';
import { useCanvasLayout } from './useCanvasLayout';

export function useImageCanvas() {
  // Get base state management
  const canvasState = useCanvasState();
  
  // Get image generation capabilities
  const imageGeneration = useImageGeneration({
    updateImage: canvasState.updateImage,
    setError: canvasState.setError,
  });
  
  // Get image operations
  const imageOperations = useImageOperations({
    ...canvasState,
    ...imageGeneration,
  });
  
  // Get canvas layout operations
  const canvasLayout = useCanvasLayout({
    images: canvasState.images,
    setImages: canvasState.setImages,
    setIsOrganizing: canvasState.setIsOrganizing,
    clearAll: canvasState.clearAll,
    cleanup: imageGeneration.cleanup,
  });

  return {
    // State
    images: canvasState.images,
    selectedImageId: canvasState.selectedImageId,
    selectedImage: canvasState.selectedImage,
    currentPrompt: canvasState.currentPrompt,
    isOrganizing: canvasState.isOrganizing,
    error: canvasState.error,
    
    // State setters
    setCurrentPrompt: canvasState.setCurrentPrompt,
    
    // Refs
    isUserInputRef: imageOperations.isUserInputRef,
    
    // Image operations
    createNewTile: imageOperations.createNewTile,
    updateSelectedTile: imageOperations.updateSelectedTile,
    handleImageDrag: imageOperations.handleImageDrag,
    handleImageSelect: imageOperations.handleImageSelect,
    handleCanvasClick: imageOperations.handleCanvasClick,
    handleImageDelete: imageOperations.handleImageDelete,
    handleImageDuplicate: imageOperations.handleImageDuplicate,
    handleImageExpand: imageOperations.handleImageExpand,
    
    // Canvas operations
    organizeInGrid: canvasLayout.organizeInGrid,
    clearCanvas: canvasLayout.clearCanvas,
    dismissError: canvasState.dismissError,
    
    // Cleanup
    cleanup: imageGeneration.cleanup,
  };
} 