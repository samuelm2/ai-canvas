import { useCallback, useRef } from 'react';
import { CanvasImage } from '../types';

// Grid layout constants
const GRID_GAP = 20;
const STANDARD_IMAGE_SIZE = 256;

interface UseImageOperationsProps {
  images: CanvasImage[];
  selectedImageId: string | null;
  currentPrompt: string;
  updateImage: (id: string, updates: Partial<CanvasImage>) => void;
  deleteImage: (id: string) => void;
  selectImage: (id: string | null) => void;
  setCurrentPrompt: (prompt: string) => void;
  setImages: (images: CanvasImage[]) => void;
  addImage: (image: CanvasImage) => void;
  setError: (error: string | null) => void;
  generateImageForTile: (tileId: string, prompt: string) => Promise<void>;
  generatePromptVariations: (prompt: string) => Promise<any>;
  cancelActiveRequest: (tileId: string) => void;
}

export function useImageOperations(props: UseImageOperationsProps) {
  const {
    images,
    selectedImageId,
    currentPrompt,
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

  const isUserInputRef = useRef(false);

  // Generate unique ID for new images
  const generateId = () => `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle image dragging
  const handleImageDrag = useCallback((id: string, x: number, y: number) => {
    updateImage(id, { x, y });
  }, [updateImage]);

  // Handle image selection
  const handleImageSelect = useCallback((id: string) => {
    selectImage(id);
    
    const selectedImg = images.find(img => img.id === id);
    if (selectedImg?.prompt) {
      isUserInputRef.current = false;
      setCurrentPrompt(selectedImg.prompt);
    }
  }, [images, selectImage, setCurrentPrompt]);

  // Handle canvas click (deselection)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectImage(null);
      isUserInputRef.current = false;
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
    const imageToDuplicate = images.find(img => img.id === id);
    if (!imageToDuplicate) return;
    
    const newImage: CanvasImage = {
      ...imageToDuplicate,
      id: generateId(),
      x: imageToDuplicate.x + 30,
      y: imageToDuplicate.y + 30,
      selected: false,
      loadingState: 'finished',
    };
    
    addImage(newImage);
  }, [images, addImage]);

  // Handle image expansion into 4 variations
  const handleImageExpand = useCallback(async (id: string) => {
    const imageToExpand = images.find(img => img.id === id);
    if (!imageToExpand?.prompt) return;
    
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
        loadingState: 'waitingOnAPI',
      };
    });
    
    setImages([...images, ...placeholderImages]);
    
    try {
      const variationsResult = await generatePromptVariations(imageToExpand.prompt);
      
      if (!variationsResult.success || !variationsResult.variations) {
        setError('Failed to generate prompt variations');
        setImages(images.filter(img => !placeholderImages.some(ph => ph.id === img.id)));
        return;
      }
      
      placeholderImages.forEach(async (placeholderImage, index) => {
        const actualPrompt = variationsResult.variations![index];
        updateImage(placeholderImage.id, { prompt: actualPrompt });
        await generateImageForTile(placeholderImage.id, actualPrompt);
      });
      
    } catch (error) {
      console.error('Error expanding image:', error);
      setError('Failed to expand image');
      setImages(images.filter(img => !placeholderImages.some(ph => ph.id === img.id)));
    }
  }, [images, setImages, setError, updateImage, generateImageForTile, generatePromptVariations]);

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
      loadingState: 'waitingOnAPI',
    };
    
    addImage(newImage);
    selectImage(newImageId);
    
    await generateImageForTile(newImageId, prompt);
  }, [addImage, selectImage, generateImageForTile]);

  // Update selected tile
  const updateSelectedTile = useCallback(async (prompt: string) => {
    if (!selectedImageId) return;
    
    cancelActiveRequest(selectedImageId);
    
    updateImage(selectedImageId, { 
      prompt, 
      loadingState: 'waitingOnAPI' 
    });
    
    await generateImageForTile(selectedImageId, prompt);
  }, [selectedImageId, cancelActiveRequest, updateImage, generateImageForTile]);

  return {
    isUserInputRef,
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