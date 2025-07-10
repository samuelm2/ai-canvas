import { useCanvasState } from './useCanvasState';
import { useImageGeneration } from './useImageGeneration';
import { useImageOperations } from './useImageOperations';
import { useCanvasLayout } from './useCanvasLayout';
import { useDocumentOperations } from './useDocumentOperations';

/**
 * useImageCanvas - Main hook that orchestrates all canvas functionality
 * 
 * @returns {Object} Complete canvas state and operations
 * 
 * @description The primary hook that combines all canvas-related hooks into a single
 * interface. It provides a comprehensive API for managing the AI image canvas,
 * including state management, image operations, layout management, and document
 * persistence. This hook serves as the central coordination point for all canvas
 * functionality.
 * 
 * @example
 * const {
 *   // State
 *   images, selectedImage, currentPrompt, error,
 *   // Operations
 *   createNewTile, updateSelectedTile, organizeInGrid,
 *   // Document operations
 *   saveDocument, loadDocument, copyShareUrl
 * } = useImageCanvas();
 * 
 * @returns {Object} Object containing:
 * - **State**: images, selectedImage, currentPrompt, isOrganizing, error
 * - **State setters**: setCurrentPrompt, setErrorModal
 * - **Image operations**: createNewTile, updateSelectedTile, handleImageDrag, handleImageSelect, handleCanvasClick, handleImageDelete, handleImageDuplicate, handleImageExpand
 * - **Canvas operations**: organizeInGrid, clearCanvas, dismissError
 * - **Document operations**: saveDocument, loadDocument, copyShareUrl, fileMenuStatus, shareUrl
 * - **Cleanup**: cleanup function for proper resource management
 */
export function useImageCanvas() {
  // Get base state management
  const canvasState = useCanvasState();
  
  // Get image generation capabilities
  const imageGeneration = useImageGeneration({
    updateImage: canvasState.updateImage,
    setError: canvasState.setErrorModal,
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
    setError: canvasState.setErrorModal,
    ...imageGeneration,
  });
  
  // Get document operations
  const documentOps = useDocumentOperations({
    images: canvasState.images,
    setImages: canvasState.setImages,
    setError: canvasState.setErrorModal,
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
    setErrorModal: canvasState.setErrorModal,
    
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