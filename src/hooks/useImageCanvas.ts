import { useCanvasState } from './useCanvasState';
import { useImageGeneration } from './useImageGeneration';
import { useImageOperations } from './useImageOperations';
import { useCanvasLayout } from './useCanvasLayout';
import { useDocumentOperations } from './useDocumentOperations';

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
    images: canvasState.images,
    selectedImageId: canvasState.selectedImageId,
    updateImage: canvasState.updateImage,
    deleteImage: canvasState.deleteImage,
    selectImage: canvasState.selectImage,
    setCurrentPrompt: canvasState.setCurrentPrompt,
    setImages: canvasState.setImages,
    addImage: canvasState.addImage,
    setError: canvasState.setError,
    ...imageGeneration,
  });
  
  // Get document operations
  const documentOps = useDocumentOperations({
    images: canvasState.images,
    setImages: canvasState.setImages,
    setError: canvasState.setError,
    clearAll: canvasState.clearAll,
    updateImage: canvasState.updateImage,
    preloadImage: imageGeneration.preloadImage,
  });

  // Get canvas layout operations
  const canvasLayout = useCanvasLayout({
    images: canvasState.images,
    setImages: canvasState.setImages,
    setIsOrganizing: canvasState.setIsOrganizing,
    clearAll: canvasState.clearAll,
    cleanup: imageGeneration.cleanup,
    resetDocumentState: documentOps.resetDocumentState,
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
    
    // Document operations
    saveDocument: documentOps.saveDocument,
    loadDocument: documentOps.loadDocument,
    copyShareUrl: documentOps.copyShareUrl,
    resetDocumentState: documentOps.resetDocumentState,
    fileMenuStatus: documentOps.fileMenuStatus,
    isLoadingDocument: documentOps.isLoading,
    lastSavedDocumentId: documentOps.lastSavedDocumentId,
    shareUrl: documentOps.shareUrl,
    
    // Cleanup
    cleanup: imageGeneration.cleanup,
  };
} 