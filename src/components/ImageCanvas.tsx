'use client';

import { useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useImageCanvas } from '../hooks/useImageCanvas';
import CanvasHeader from './CanvasHeader';
import CanvasContent from './CanvasContent';

export default function ImageCanvas() {
  const {
    // State
    images,
    selectedImageId,
    selectedImage,
    currentPrompt,
    setCurrentPrompt,
    isOrganizing,
    error,
    isUserInputRef,
    
    // Image operations
    createNewTile,
    updateSelectedTile,
    handleImageDrag,
    handleImageSelect,
    handleCanvasClick,
    handleImageDelete,
    handleImageDuplicate,
    handleImageExpand,
    
    // Canvas operations
    organizeInGrid,
    clearCanvas,
    dismissError,
    cleanup,
  } = useImageCanvas();

  // Handle prompt processing with debouncing and maxWait (throttling)
  const debouncedPromptUpdate = useDebouncedCallback(
    (prompt: string) => {
      if (selectedImageId) {
        updateSelectedTile(prompt);
      } else {
        createNewTile(prompt);
      }
    },
    500, // debounce delay
    { maxWait: 2000 } // ensure it fires at least every 2000ms
  );

  // Handle prompt changes
  const handlePromptChange = useCallback((newPrompt: string) => {
    setCurrentPrompt(newPrompt);
    
    // Mark this as user input
    isUserInputRef.current = true;
    
    // Use the debounced callback
    debouncedPromptUpdate(newPrompt);
  }, [debouncedPromptUpdate, isUserInputRef, setCurrentPrompt]);

  // Handle clearing canvas with debounce cleanup
  const handleClearCanvas = useCallback(() => {
    // Cancel any pending debounced calls
    debouncedPromptUpdate.cancel();
    clearCanvas();
  }, [debouncedPromptUpdate, clearCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="w-full h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <CanvasHeader 
        currentPrompt={currentPrompt}
        onPromptChange={handlePromptChange}
        selectedImageId={selectedImageId}
        selectedImage={selectedImage}
        onOrganizeGrid={organizeInGrid}
        onClearCanvas={handleClearCanvas}
        imagesCount={images.length}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute top-44 left-4 right-4 z-30 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={dismissError}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Canvas Content */}
      <CanvasContent 
        images={images}
        onCanvasClick={handleCanvasClick}
        onImageDrag={handleImageDrag}
        onImageSelect={handleImageSelect}
        onImageDelete={handleImageDelete}
        onImageDuplicate={handleImageDuplicate}
        onImageExpand={handleImageExpand}
        isOrganizing={isOrganizing}
      />

      {/* Stats */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
        {images.length} image{images.length !== 1 ? 's' : ''} on canvas
      </div>
    </div>
  );
} 