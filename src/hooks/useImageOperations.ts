import { useCallback, useRef } from 'react';
import { CanvasImage, PromptVariationsResponse } from '../types';

// Grid layout constants
const GRID_GAP = 20;
const STANDARD_IMAGE_SIZE = 256;

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
    
    const crossSpacing = STANDARD_IMAGE_SIZE + GRID_GAP * 2;
    const negativeThreshold = STANDARD_IMAGE_SIZE * 0.3;
    
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
        width: STANDARD_IMAGE_SIZE,
        height: STANDARD_IMAGE_SIZE,
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
    
    const newImage: CanvasImage = {
      id: newImageId,
      src: '',
      x: 100 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: 256,
      height: 256,
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