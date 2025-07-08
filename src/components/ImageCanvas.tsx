'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import DraggableImage from './DraggableImage';
import PromptInput from './PromptInput';
import { CanvasImage, GridConfig } from '../types';
import { AIService } from '../services/aiService';
import { useDebouncedCallback } from 'use-debounce';

// Grid layout constants
const GRID_GAP = 20;
const GRID_START_X = 50;
const GRID_START_Y = 50; // Same as X - header compensation handled in CSS
const STANDARD_IMAGE_SIZE = 256;
const GRID_RIGHT_PADDING = 50;

export default function ImageCanvas() {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isUserInputRef = useRef(false);
  
  // Track active requests for cancellation
  const activeRequestsRef = useRef<Map<string, AbortController>>(new Map());
  
  // Helper function to preload an image
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };
  
  // Demo mode is now handled automatically on the server side

  // Grid configuration
  const gridConfig: GridConfig = {
    gap: GRID_GAP,
    startX: GRID_START_X,
    startY: GRID_START_Y,
  };

  // Generate unique ID for new images
  const generateId = () => `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get the currently selected image
  const selectedImage = images.find(img => img.id === selectedImageId);

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
    setError(null);
    
    // Mark this as user input
    isUserInputRef.current = true;
    
    // Use the debounced callback
    debouncedPromptUpdate(newPrompt);
    
  }, [debouncedPromptUpdate]);

  // Cancel any active request for a tile
  const cancelActiveRequest = (tileId: string) => {
    const activeController = activeRequestsRef.current.get(tileId);
    if (activeController) {
      activeController.abort();
      activeRequestsRef.current.delete(tileId);
    }
  };

  // Create a new tile
  const createNewTile = async (prompt: string) => {
    const newImageId = generateId();
    
    // Create placeholder tile
    const newImage: CanvasImage = {
      id: newImageId,
      src: '', // Will be updated when image loads
      x: 100 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: 256,
      height: 256,
      prompt,
      selected: true,
      loadingState: 'waitingOnAPI',
    };
    
    setImages(prev => [...prev, newImage]);
    setSelectedImageId(newImageId);
    
    // Generate the image
    await generateImageForTile(newImageId, prompt);
  };

  // Update selected tile
  const updateSelectedTile = async (prompt: string) => {
    if (!selectedImageId) return;
    
    // Cancel any existing request for this tile
    cancelActiveRequest(selectedImageId);
    
    // Update the tile's prompt and mark as generating
    setImages(prev => prev.map(img => 
      img.id === selectedImageId 
        ? { ...img, prompt, loadingState: 'waitingOnAPI' }
        : img
    ));
    
    // Generate the image
    await generateImageForTile(selectedImageId, prompt);
  };

  // Generate image for a specific tile
  const generateImageForTile = async (tileId: string, prompt: string) => {
    if (!prompt || prompt.trim() === '') {
      setError('Cannot generate image with empty prompt');
      return;
    }
    
    // Cancel any existing request for this tile
    cancelActiveRequest(tileId);
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    activeRequestsRef.current.set(tileId, abortController);
    
    try {
      // Always call generateImage - server handles demo mode automatically
      const result = await AIService.generateImage(prompt, abortController.signal);
      
      // Remove from active requests if not already cancelled
      activeRequestsRef.current.delete(tileId);
      
      if (result.success && result.imageUrl) {
        // Set state to urlLoading but don't update src yet
        setImages(prev => prev.map(img => 
          img.id === tileId 
            ? { ...img, loadingState: 'urlLoading' }
            : img
        ));
        
        // Preload the image
        try {
          await preloadImage(result.imageUrl);
          
          // Only update src after image is fully loaded
          setImages(prev => prev.map(img => 
            img.id === tileId 
              ? { ...img, src: result.imageUrl!, loadingState: 'finished' }
              : img
          ));
        } catch (error) {
          console.error('Failed to preload image:', error);
          setError('Failed to load image');
          setImages(prev => prev.map(img => 
            img.id === tileId 
              ? { ...img, loadingState: 'finished' }
              : img
          ));
        }
      } else if (result.error !== 'Request cancelled') {
        // Only show error if it wasn't cancelled
        setError(result.error || 'Failed to generate image');
        setImages(prev => prev.map(img => 
          img.id === tileId 
            ? { ...img, loadingState: 'finished' }
            : img
        ));
      }
    } catch (err: any) {
      // Remove from active requests
      activeRequestsRef.current.delete(tileId);
      
      if (err.name !== 'AbortError') {
        setError('Network error occurred');
        setImages(prev => prev.map(img => 
          img.id === tileId 
            ? { ...img, isGenerating: false }
            : img
        ));
      }
    }
  };

  // Handle image dragging
  const handleImageDrag = useCallback((id: string, x: number, y: number) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, x, y } : img
    ));
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((id: string) => {
    setSelectedImageId(id);
    setImages(prev => prev.map(img => 
      ({ ...img, selected: img.id === id })
    ));
    
    // Update prompt input with selected image's prompt - but mark as NOT user input
    const selectedImg = images.find(img => img.id === id);
    if (selectedImg?.prompt) {
      isUserInputRef.current = false; // Prevent generation
      setCurrentPrompt(selectedImg.prompt);
    }
  }, [images]);

  // Handle deselection (clicking on canvas background)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking the canvas directly, not on an image
    if (e.target === e.currentTarget) {
      setSelectedImageId(null);
      setImages(prev => prev.map(img => 
        ({ ...img, selected: false })
      ));
      isUserInputRef.current = false; // Prevent generation
      setCurrentPrompt('');
    }
  }, []);

  // Handle image deletion
  const handleImageDelete = useCallback((id: string) => {
    // Cancel any active request for this tile
    cancelActiveRequest(id);
    
    setImages(prev => prev.filter(img => img.id !== id));
    // If deleting the selected image, clear selection and prompt
    if (selectedImageId === id) {
      setSelectedImageId(null);
      isUserInputRef.current = false; // Prevent generation
      setCurrentPrompt('');
    }
  }, [selectedImageId]);

  // Handle image duplication
  const handleImageDuplicate = useCallback((id: string) => {
    const imageToDuplicate = images.find(img => img.id === id);
    if (!imageToDuplicate) return;
    
    // Create a new image with the same properties but new ID and offset position
    const newImage: CanvasImage = {
      ...imageToDuplicate,
      id: generateId(),
      x: imageToDuplicate.x + 30, // Offset to the right
      y: imageToDuplicate.y + 30, // Offset down
      selected: false, // Don't select the duplicate
      loadingState: 'finished', // Not generating since we're copying existing image
    };
    
    setImages(prev => [...prev, newImage]);
  }, [images]);



  // Handle image expansion into 4 variations
  const handleImageExpand = useCallback(async (id: string) => {
    const imageToExpand = images.find(img => img.id === id);
    if (!imageToExpand) return;
    
    const prompt = imageToExpand.prompt;
    if (!prompt) return;
    
    // Create placeholder tiles immediately for better UX
    const crossSpacing = STANDARD_IMAGE_SIZE + GRID_GAP * 2;
    const negativeThreshold = STANDARD_IMAGE_SIZE * 0.3; // 30% of image size
    
    const placeholderImages: CanvasImage[] = Array.from({ length: 4 }, (_, index) => {
      let offsetX = 0;
      let offsetY = 0;
      
      // Position in cross pattern, only use fallback if more than 30% would be in negative
      switch (index) {
        case 0: // Above
          offsetX = 0;
          // Only use fallback if more than 30% would be in negative Y
          offsetY = (imageToExpand.y - crossSpacing < -negativeThreshold) ? crossSpacing * 2 : -crossSpacing;
          break;
        case 1: // Left
          // Only use fallback if more than 30% would be in negative X
          offsetX = (imageToExpand.x - crossSpacing < -negativeThreshold) ? crossSpacing * 2 : -crossSpacing;
          offsetY = 0;
          break;
        case 2: // Right (normal)
          offsetX = crossSpacing;
          offsetY = 0;
          break;
        case 3: // Below (normal)
          offsetX = 0;
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
        prompt: `${prompt} (generating variation...)`, // Temporary prompt
        selected: false,
        loadingState: 'waitingOnAPI',
      };
    });
    
    // Add placeholder images immediately
    setImages(prev => [...prev, ...placeholderImages]);
    
    try {
      // Generate 4 prompt variations
      const variationsResult = await AIService.generatePromptVariations(prompt);
      
      if (!variationsResult.success || !variationsResult.variations) {
        setError('Failed to generate prompt variations');
        // Remove placeholder images on error
        setImages(prev => prev.filter(img => !placeholderImages.some(ph => ph.id === img.id)));
        return;
      }
      
      // Update placeholder images with actual prompts and start generation
      placeholderImages.forEach(async (placeholderImage, index) => {
        const actualPrompt = variationsResult.variations![index];
        
        // Update the placeholder with actual prompt
        setImages(prev => prev.map(img => 
          img.id === placeholderImage.id 
            ? { ...img, prompt: actualPrompt }
            : img
        ));
        
        // Generate the image
        await generateImageForTile(placeholderImage.id, actualPrompt);
      });
      
    } catch (error) {
      console.error('Error expanding image:', error);
      setError('Failed to expand image');
      // Remove placeholder images on error
      setImages(prev => prev.filter(img => !placeholderImages.some(ph => ph.id === img.id)));
    }
  }, [images]);

  // Organize images in a grid
  const organizeInGrid = useCallback(() => {
    setIsOrganizing(true);
    
    // Calculate dynamic columns based on window width
    const windowWidth = window.innerWidth;
    const availableWidth = windowWidth - gridConfig.startX - GRID_RIGHT_PADDING;
    const itemWidthWithGap = STANDARD_IMAGE_SIZE + gridConfig.gap;
    const calculatedColumns = Math.max(1, Math.floor(availableWidth / itemWidthWithGap));
    
    setImages(prev => prev.map((img, index) => {
      const row = Math.floor(index / calculatedColumns);
      const col = index % calculatedColumns;
      
      return {
        ...img,
        x: gridConfig.startX + col * (STANDARD_IMAGE_SIZE + gridConfig.gap),
        y: gridConfig.startY + row * (STANDARD_IMAGE_SIZE + gridConfig.gap),
      };
    }));
    
    setTimeout(() => setIsOrganizing(false), 500);
  }, [images, gridConfig]);

  // Clear all images
  const clearCanvas = useCallback(() => {
    // Cancel all active requests
    activeRequestsRef.current.forEach(controller => controller.abort());
    activeRequestsRef.current.clear();
    
    setImages([]);
    setError(null);
    setSelectedImageId(null);
    isUserInputRef.current = false; // Prevent generation
    setCurrentPrompt('');
    
    // Cancel any pending debounced calls
    debouncedPromptUpdate.cancel();
  }, [debouncedPromptUpdate]);

  // Dismiss error
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup active requests on unmount (timers handled by hook)
  useEffect(() => {
    return () => {
      // Cancel all active requests
      activeRequestsRef.current.forEach(controller => controller.abort());
      activeRequestsRef.current.clear();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-sm p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">AI Image Canvas</h1>
            <p className="text-sm text-blue-600 mt-1">
              🤖 Server automatically uses demo images when no API key is configured
            </p>
          </div>
          
          {/* Live Prompt Input */}
          <div className="w-full max-w-2xl">
            <PromptInput 
              value={currentPrompt}
              onChange={handlePromptChange}
              placeholder={selectedImageId ? "Edit prompt to live-update selected image..." : "Type to create a new image..."}
              showSubmitButton={false}
              className="mb-2"
            />
            <div className="text-xs text-gray-500 text-center">
              {selectedImageId ? 
                `Live editing: ${selectedImage?.prompt || 'Selected image'} ${selectedImage?.loadingState === 'waitingOnAPI' || selectedImage?.loadingState === 'urlLoading' ? '(updating...)' : ''}` : 
                'Type above to create a new image tile • Updates after 500ms of no typing (max 2s while typing)'
              }
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={organizeInGrid}
              disabled={images.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                images.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              📐 Organize Grid
            </button>
            <button
              onClick={clearCanvas}
              disabled={images.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                images.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      </div>

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

      {/* Canvas Area */}
      <div 
        className="absolute top-52 left-0 right-0 bottom-0 overflow-auto"
      >
        {/* Scrollable Canvas Container */}
        <div 
          className="relative min-w-full min-h-full"
          onClick={handleCanvasClick}
        >
          {/* Grid Guidelines (subtle) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-gray-300" />
              ))}
            </div>
          </div>

          {/* Instructions */}
          {images.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-xl font-semibold mb-2">Start Typing to Create</h2>
                <p className="text-sm">Enter a prompt above to generate your first image tile</p>
              </div>
            </div>
          )}

          {/* Draggable Images */}
          {images.map((image) => (
            <DraggableImage
              key={image.id}
              image={image}
              onDrag={handleImageDrag}
              onDelete={handleImageDelete}
              onSelect={handleImageSelect}
              onDuplicate={handleImageDuplicate}
              onExpand={handleImageExpand}
              isOrganizing={isOrganizing}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
        {images.length} image{images.length !== 1 ? 's' : ''} on canvas
        {selectedImageId && ' • 1 selected'}
      </div>
    </div>
  );
} 