import { useCallback } from 'react';
import { CanvasImage } from '../types';

// Grid layout constants
const GRID_GAP = 20;
const GRID_START_X = 50;
const GRID_START_Y = 50;
const STANDARD_IMAGE_SIZE = 256;
const MOBILE_IMAGE_SIZE = 128; // Even smaller size for mobile
const GRID_RIGHT_PADDING = 50;

// Utility function to get image size based on screen width
const getImageSize = (windowWidth: number): number => {
  return windowWidth <= 768 ? MOBILE_IMAGE_SIZE : STANDARD_IMAGE_SIZE;
};

/**
 * Props for the useCanvasLayout hook
 * 
 * @interface UseCanvasLayoutProps
 * @property {CanvasImage[]} images - Array of canvas images to manage
 * @property {function} setImages - Function to update the images array
 * @property {function} setIsOrganizing - Function to set the organizing state
 * @property {function} clearAll - Function to clear all canvas state
 * @property {function} cleanup - Function to cleanup resources
 * @property {function} resetDocumentState - Function to reset document state
 */
interface UseCanvasLayoutProps {
  images: CanvasImage[];
  setImages: (images: CanvasImage[]) => void;
  setIsOrganizing: (isOrganizing: boolean) => void;
  clearAll: () => void;
  cleanup: () => void;
  resetDocumentState: () => void;
}

/**
 * useCanvasLayout - Hook for managing canvas layout and organization
 * 
 * @param {UseCanvasLayoutProps} props - Hook configuration
 * @returns {Object} Layout management functions
 * 
 * @description Provides functionality for organizing and managing the layout
 * of images on the canvas. Handles grid organization with responsive sizing
 * and canvas clearing with proper cleanup.
 * 
 * @example
 * const { organizeInGrid, clearCanvas } = useCanvasLayout({
 *   images,
 *   setImages,
 *   setIsOrganizing,
 *   clearAll,
 *   cleanup,
 *   resetDocumentState
 * });
 * 
 * @returns {Object} Object containing:
 * - **organizeInGrid**: Function to arrange images in a responsive grid layout
 * - **clearCanvas**: Function to clear the canvas with proper cleanup
 */
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
    const itemWidthWithGap = getImageSize(windowWidth) + GRID_GAP;
    const calculatedColumns = Math.max(1, Math.floor(availableWidth / itemWidthWithGap));
    
    const organizedImages = images.map((img, index) => {
      const row = Math.floor(index / calculatedColumns);
      const col = index % calculatedColumns;
      
      return {
        ...img,
        x: GRID_START_X + col * (getImageSize(windowWidth) + GRID_GAP),
        y: GRID_START_Y + row * (getImageSize(windowWidth) + GRID_GAP),
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