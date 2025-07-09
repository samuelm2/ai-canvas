'use client';

import { useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams } from 'next/navigation';
import { useImageCanvas } from '../hooks/useImageCanvas';
import CanvasHeader from './CanvasHeader';
import CanvasContent from './CanvasContent';

export default function ImageCanvas() {
  const searchParams = useSearchParams();
  
  const {
    // State
    images,
    selectedImage,
    currentPrompt,
    isOrganizing,
    error,
    
    // State setters
    setCurrentPrompt,
    
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
    
    // Document operations
    saveDocument,
    loadDocument,
    copyShareUrl,
    fileMenuStatus,
    isLoadingDocument,
    shareUrl,
    lastSavedDocumentId,
    
    cleanup,
  } = useImageCanvas();

  // Handle prompt processing with debouncing and maxWait (throttling)
  const debouncedPromptUpdate = useDebouncedCallback(
    (prompt: string) => {
      if (selectedImage) {
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
    
    // Use the debounced callback
    debouncedPromptUpdate(newPrompt);
  }, [debouncedPromptUpdate, setCurrentPrompt]);

  // Handle clearing canvas with debounce cleanup
  const handleClearCanvas = useCallback(() => {
    // Cancel any pending debounced calls
    debouncedPromptUpdate.cancel();
    clearCanvas();
  }, [debouncedPromptUpdate, clearCanvas]);

  // Handle automatic document loading from URL (only on initial page load)
  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId) {
      loadDocument(docId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
        selectedImage={selectedImage}
        onOrganizeGrid={organizeInGrid}
        onClearCanvas={handleClearCanvas}
        imagesCount={images.length}
        onSaveDocument={saveDocument}
        onCopyShareUrl={copyShareUrl}
        fileMenuStatus={fileMenuStatus}
        shareUrl={shareUrl}
        lastSavedDocumentId={lastSavedDocumentId}
        isLoadingDocument={isLoadingDocument}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute top-44 left-4 right-4 z-30 alert-error">
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
      <div className="absolute bottom-4 left-4 stats-badge">
        {images.length} image{images.length !== 1 ? 's' : ''} on canvas
      </div>
    </div>
  );
} 