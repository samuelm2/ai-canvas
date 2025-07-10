import { useCallback, useRef } from 'react';
import { CanvasImage, PromptVariationsResponse } from '../types';

// Grid layout constants
const GRID_GAP = 20;
const STANDARD_IMAGE_SIZE = 256;
const MOBILE_IMAGE_SIZE = 128; // Even smaller size for mobile

// Utility function to get image size based on screen width
const getImageSize = (windowWidth: number): number => {
  return windowWidth <= 768 ? MOBILE_IMAGE_SIZE : STANDARD_IMAGE_SIZE;
};

interface UseImageOperationsProps {
  images: CanvasImage[];
  selectedImageId: string | null;
  updateImage: (id: string, updates: Partial<CanvasImage>) => void;
  deleteImage: (id: string) => void;
  selectImage: (id: string | null) => void;
  setCurrentPrompt: (prompt: string) => void;
  setImages: (images: CanvasImage[]) => void;
  addImage: (image: CanvasImage) => void;
  setError: (error: string | null) => void;
  generateImageForTile: (tileId: string, prompt: string) => Promise<void>;
  generatePromptVariations: (prompt: string) => Promise<PromptVariationsResponse>;
  cancelActiveRequest: (tileId: string) => void;
}

/**
 * Custom hook for managing canvas image operations and interactions.
 * 
 * This hook provides a comprehensive set of operations for managing images on a canvas,
 * including positioning, selection, z-index management, duplication, expansion into variations,
 * and tile creation/updating. It handles both user interactions and automated operations
 * like generating image variations.
 * 
 * Key features:
 * - Smart z-index management with normalization to prevent overflow
 * - Responsive image sizing based on screen width
 * - Image expansion into 4 variations with intelligent positioning
 * - Drag and drop functionality
 * - Selection and deselection handling
 * - Tile creation and updating with loading states
 * 
 * @param props - Configuration object containing image state and operations
 * @param props.images - Array of canvas images currently displayed
 * @param props.selectedImageId - ID of the currently selected image, null if none selected
 * @param props.updateImage - Function to update a specific image's properties
 * @param props.deleteImage - Function to remove an image from the canvas
 * @param props.selectImage - Function to select/deselect an image
 * @param props.setCurrentPrompt - Function to update the current prompt input
 * @param props.setImages - Function to replace the entire images array
 * @param props.addImage - Function to add a new image to the canvas
 * @param props.setError - Function to set error messages for user feedback
 * @param props.generateImageForTile - Function to generate an image for a specific tile
 * @param props.generatePromptVariations - Function to generate prompt variations for image expansion
 * @param props.cancelActiveRequest - Function to cancel ongoing image generation requests
 * 
 * @returns Object containing handler functions for various image operations
 * @returns returns.handleImageDrag - Handler for image drag operations (id, x, y)
 * @returns returns.handleImageSelect - Handler for image selection with z-index management
 * @returns returns.handleCanvasClick - Handler for canvas clicks (deselection)
 * @returns returns.handleImageDelete - Handler for image deletion with request cancellation
 * @returns returns.handleImageDuplicate - Handler for creating image duplicates
 * @returns returns.handleImageExpand - Handler for expanding image into 4 variations
 * @returns returns.createNewTile - Handler for creating new tiles with prompt generation
 * @returns returns.updateSelectedTile - Handler for updating the selected tile's prompt
 * 
 * @example
 * ```tsx
 * const operations = useImageOperations({
 *   images,
 *   selectedImageId,
 *   updateImage,
 *   deleteImage,
 *   selectImage,
 *   setCurrentPrompt,
 *   setImages,
 *   addImage,
 *   setError,
 *   generateImageForTile,
 *   generatePromptVariations,
 *   cancelActiveRequest,
 * });
 * 
 * // Use the operations
 * operations.handleImageSelect('image_123');
 * operations.createNewTile('A beautiful landscape');
 * ```
 */
export function useImageOperations(props: UseImageOperationsProps) {
  const {
    images,
    selectedImageId,
    updateImage,
    deleteImage,
    selectImage,
    setCurrentPrompt,
    setImages,
    addImage,
    setError,
    generateImageForTile,
    generatePromptVariations,
    cancelActiveRequest,
  } = props;

  // Keep a ref to current images to avoid re-renders when accessing them
  const imagesRef = useRef<CanvasImage[]>(images);
  imagesRef.current = images;

  // Generate unique ID for new images
  const generateId = () => `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Smart z-index management with normalization
  // This should match --z-image-max from CSS (999)
  const MAX_Z_INDEX = 999;
  
  const normalizeZIndexes = useCallback(() => {
    // Re-number all images from 1 to N based on current z-order
    const sortedImages = [...imagesRef.current].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    sortedImages.forEach((img, index) => {
      updateImage(img.id, { zIndex: index + 1 });
    });
    console.log('Z-indexes normalized');
  }, [updateImage]);
  
  const getSmartZIndex = useCallback((imageId: string) => {
    const currentImage = imagesRef.current.find(img => img.id === imageId);
    const maxZ = Math.max(0, ...imagesRef.current.map(img => img.zIndex || 0));
    
    // If already on top, don't change z-index
    if (currentImage?.zIndex === maxZ && maxZ > 0) {
      return currentImage.zIndex;
    }
    
    // If z-indexes are getting too high, normalize them
    if (maxZ >= MAX_Z_INDEX) {
      normalizeZIndexes();
      // After normalization, bring this image to front
      return imagesRef.current.length + 1;
    }
    
    // Normal case: bring to front
    return maxZ + 1;
  }, [normalizeZIndexes]);

  // Handle image dragging
  const handleImageDrag = useCallback((id: string, x: number, y: number) => {
    updateImage(id, { x, y });
  }, [updateImage]);

  // Handle image selection
  const handleImageSelect = useCallback((id: string) => {
    selectImage(id);
    
    // Bring selected image to front (smart z-index)
    updateImage(id, { zIndex: getSmartZIndex(id) });
    
    const selectedImg = imagesRef.current.find(img => img.id === id);
    if (selectedImg?.prompt) {
      setCurrentPrompt(selectedImg.prompt);
    }
  }, [selectImage, setCurrentPrompt, updateImage, getSmartZIndex]);

  // Handle canvas click (deselection)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectImage(null);
      setCurrentPrompt('');
    }
  }, [selectImage, setCurrentPrompt]);

  // Handle image deletion
  const handleImageDelete = useCallback((id: string) => {
    cancelActiveRequest(id);
    deleteImage(id);
  }, [cancelActiveRequest, deleteImage]);

  // Handle image duplication
  const handleImageDuplicate = useCallback((id: string) => {
    const imageToDuplicate = imagesRef.current.find(img => img.id === id);
    if (!imageToDuplicate) return;
    
    const newImage: CanvasImage = {
      ...imageToDuplicate,
      id: generateId(),
      x: imageToDuplicate.x + 30,
      y: imageToDuplicate.y + 30,
      selected: false,
      displayState: 'ready',
      zIndex: Math.max(0, ...imagesRef.current.map(img => img.zIndex || 0)) + 1,
    };
    
    addImage(newImage);
  }, [addImage]);

  // Handle image expansion into 4 variations
  const handleImageExpand = useCallback(async (id: string) => {
    const imageToExpand = imagesRef.current.find(img => img.id === id);
    if (!imageToExpand?.prompt) return;
    
    // Get the current max z-index
    const currentMaxZ = Math.max(0, ...imagesRef.current.map(img => img.zIndex || 0));
    
    // Create placeholder images with z-indexes starting from currentMaxZ + 1
    const placeholderStartZ = currentMaxZ + 1;
    
    // The expanded image should be on top of placeholders
    const expandedImageZ = placeholderStartZ + 4;
    
    // Update the expanded image's z-index in the current images array
    const updatedImages = imagesRef.current.map(img => 
      img.id === id ? { ...img, zIndex: expandedImageZ } : img
    );
    
    const imageSize = getImageSize(window.innerWidth);
    const crossSpacing = imageSize + GRID_GAP * 2;
    const negativeThreshold = imageSize * 0.3;
    
    const placeholderImages: CanvasImage[] = Array.from({ length: 4 }, (_, index) => {
      let offsetX = 0;
      let offsetY = 0;
      
      switch (index) {
        case 0: // Above
          offsetY = (imageToExpand.y - crossSpacing < -negativeThreshold) ? crossSpacing * 2 : -crossSpacing;
          break;
        case 1: // Left
          offsetX = (imageToExpand.x - crossSpacing < -negativeThreshold) ? crossSpacing * 2 : -crossSpacing;
          break;
        case 2: // Right
          offsetX = crossSpacing;
          break;
        case 3: // Below
          offsetY = crossSpacing;
          break;
      }
      
      return {
        id: generateId(),
        src: '',
        x: imageToExpand.x + offsetX,
        y: imageToExpand.y + offsetY,
        width: imageSize,
        height: imageSize,
        prompt: `${imageToExpand.prompt} (generating variation...)`,
        selected: false,
        displayState: 'loading',
        zIndex: placeholderStartZ + index,
      };
    });
    
    setImages([...updatedImages, ...placeholderImages]);
    
    try {
      const variationsResult = await generatePromptVariations(imageToExpand.prompt);
      
      if (!variationsResult.success || !variationsResult.variations) {
        setError('Failed to generate prompt variations');
        setImages(imagesRef.current.filter(img => !placeholderImages.some(ph => ph.id === img.id)));
        return;
      }
      
      // Generate variations for each placeholder
      await Promise.allSettled(placeholderImages.map(async (placeholderImage, index) => {
        const actualPrompt = variationsResult.variations![index];
        updateImage(placeholderImage.id, { prompt: actualPrompt });
        await generateImageForTile(placeholderImage.id, actualPrompt);
      }));
      
      // Check which tiles failed by looking at their final state
      const failedTiles = placeholderImages.filter(placeholderImage => {
        const currentTile = imagesRef.current.find(img => img.id === placeholderImage.id);
        return currentTile?.displayState === 'failed';
      });
      
      if (failedTiles.length > 0) {
        setError(`Failed to generate ${failedTiles.length} of 4 variations`);
      }
      
    } catch (error) {
      console.error('Error expanding image:', error);
      setError('Failed to expand image');
      setImages(imagesRef.current.filter(img => !placeholderImages.some(ph => ph.id === img.id)));
    }
  }, [setImages, setError, updateImage, generateImageForTile, generatePromptVariations]);

  // Create a new tile
  const createNewTile = useCallback(async (prompt: string) => {
    const newImageId = generateId();
    const imageSize = getImageSize(window.innerWidth);
    
    const newImage: CanvasImage = {
      id: newImageId,
      src: '',
      x: 50, // Top-left position
      y: 50, // Top-left position
      width: imageSize,
      height: imageSize,
      prompt,
      selected: true,
      displayState: 'loading',
      zIndex: Math.max(0, ...imagesRef.current.map(img => img.zIndex || 0)) + 1,
    };
    
    addImage(newImage);
    selectImage(newImageId);
    
    // Fire-and-forget: generateImageForTile handles its own errors and state updates
    generateImageForTile(newImageId, prompt);
  }, [addImage, selectImage, generateImageForTile]);

  // Update selected tile
  const updateSelectedTile = useCallback(async (prompt: string) => {
    if (!selectedImageId) return;
    
    cancelActiveRequest(selectedImageId);
    
    updateImage(selectedImageId, { 
      prompt, 
      displayState: 'updating' 
    });
    
    // Fire-and-forget: generateImageForTile handles its own errors and state updates
    generateImageForTile(selectedImageId, prompt);
  }, [selectedImageId, cancelActiveRequest, updateImage, generateImageForTile]);

  return {
    handleImageDrag,
    handleImageSelect,
    handleCanvasClick,
    handleImageDelete,
    handleImageDuplicate,
    handleImageExpand,
    createNewTile,
    updateSelectedTile,
  };
} 