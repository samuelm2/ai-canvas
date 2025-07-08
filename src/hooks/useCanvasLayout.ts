import { useCallback } from 'react';
import { CanvasImage } from '../types';

// Grid layout constants
const GRID_GAP = 20;
const GRID_START_X = 50;
const GRID_START_Y = 50;
const STANDARD_IMAGE_SIZE = 256;
const GRID_RIGHT_PADDING = 50;

interface UseCanvasLayoutProps {
  images: CanvasImage[];
  setImages: (images: CanvasImage[]) => void;
  setIsOrganizing: (isOrganizing: boolean) => void;
  clearAll: () => void;
  cleanup: () => void;
  resetDocumentState: () => void;
}

export function useCanvasLayout({ 
  images, 
  setImages, 
  setIsOrganizing, 
  clearAll, 
  cleanup,
  resetDocumentState 
}: UseCanvasLayoutProps) {
  
  // Organize images in a grid
  const organizeInGrid = useCallback(() => {
    setIsOrganizing(true);
    
    const windowWidth = window.innerWidth;
    const availableWidth = windowWidth - GRID_START_X - GRID_RIGHT_PADDING;
    const itemWidthWithGap = STANDARD_IMAGE_SIZE + GRID_GAP;
    const calculatedColumns = Math.max(1, Math.floor(availableWidth / itemWidthWithGap));
    
    const organizedImages = images.map((img, index) => {
      const row = Math.floor(index / calculatedColumns);
      const col = index % calculatedColumns;
      
      return {
        ...img,
        x: GRID_START_X + col * (STANDARD_IMAGE_SIZE + GRID_GAP),
        y: GRID_START_Y + row * (STANDARD_IMAGE_SIZE + GRID_GAP),
      };
    });
    
    setImages(organizedImages);
    setTimeout(() => setIsOrganizing(false), 500);
  }, [images, setImages, setIsOrganizing]);

  // Clear canvas with cleanup
  const clearCanvas = useCallback(() => {
    cleanup();
    clearAll();
    resetDocumentState();
  }, [cleanup, clearAll, resetDocumentState]);

  return {
    organizeInGrid,
    clearCanvas,
  };
} 