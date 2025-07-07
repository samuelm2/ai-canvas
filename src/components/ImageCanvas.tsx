'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import DraggableImage from './DraggableImage';
import PromptInput from './PromptInput';
import { CanvasImage, GridConfig } from '../types';
import { AIService } from '../services/aiService';

export default function ImageCanvas() {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple debounce control
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInputRef = useRef(false);
  
  // Track active requests for cancellation
  const activeRequestsRef = useRef<Map<string, AbortController>>(new Map());
  
  // Check if running in demo mode
  const hasApiKey = process.env.NEXT_PUBLIC_FAI_API_KEY && process.env.NEXT_PUBLIC_FAI_API_KEY.trim() !== '';
  const useDemoMode = !hasApiKey || process.env.NEXT_PUBLIC_USE_DEMO_MODE === 'true';

  // Grid configuration
  const gridConfig: GridConfig = {
    columns: 4,
    gap: 20,
    startX: 50,
    startY: 150,
  };

  // Generate unique ID for new images
  const generateId = () => `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get the currently selected image
  const selectedImage = images.find(img => img.id === selectedImageId);

  // Handle prompt changes
  const handlePromptChange = useCallback((newPrompt: string) => {
    setCurrentPrompt(newPrompt);
    setError(null);
    
    // Mark this as user input
    isUserInputRef.current = true;
    
    // Clear existing timers
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set debounce timer for when user stops typing
    debounceTimeoutRef.current = setTimeout(() => {
      isUserInputRef.current = false;
      
      // Process final prompt
      if (selectedImageId) {
        updateSelectedTile(newPrompt);
      } else {
        createNewTile(newPrompt);
      }
    }, 300);
    
  }, [selectedImageId]);

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
      isGenerating: true,
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
        ? { ...img, prompt, isGenerating: true }
        : img
    ));
    
    // Generate the image
    await generateImageForTile(selectedImageId, prompt);
  };

  // Generate image for a specific tile
  const generateImageForTile = async (tileId: string, prompt: string) => {
    // Cancel any existing request for this tile
    cancelActiveRequest(tileId);
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    activeRequestsRef.current.set(tileId, abortController);
    
    try {
      const result = useDemoMode 
        ? await AIService.generateDemoImage(prompt, abortController.signal)
        : await AIService.generateImage(prompt, abortController.signal);
      
      // Remove from active requests if not already cancelled
      activeRequestsRef.current.delete(tileId);
      
      if (result.success && result.imageUrl) {
        setImages(prev => prev.map(img => 
          img.id === tileId 
            ? { ...img, src: result.imageUrl!, isGenerating: false }
            : img
        ));
      } else if (result.error !== 'Request cancelled') {
        // Only show error if it wasn't cancelled
        setError(result.error || 'Failed to generate image');
        setImages(prev => prev.map(img => 
          img.id === tileId 
            ? { ...img, isGenerating: false }
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

  // Organize images in a grid
  const organizeInGrid = useCallback(() => {
    const standardSize = 256;
    setIsOrganizing(true);
    
    setImages(prev => prev.map((img, index) => {
      const row = Math.floor(index / gridConfig.columns);
      const col = index % gridConfig.columns;
      
      return {
        ...img,
        x: gridConfig.startX + col * (standardSize + gridConfig.gap),
        y: gridConfig.startY + row * (standardSize + gridConfig.gap),
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
    
    // Clear any pending timers
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Dismiss error
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup timers and active requests on unmount
  useEffect(() => {
    return () => {
      // Cancel all active requests
      activeRequestsRef.current.forEach(controller => controller.abort());
      activeRequestsRef.current.clear();
      
      // Clear all timers
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-sm p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">AI Image Canvas</h1>
            {useDemoMode && (
              <p className="text-sm text-orange-600 mt-1">
                🧪 Demo Mode - Using placeholder images (Add FAI API key for real AI generation)
              </p>
            )}
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
                `Live editing: ${selectedImage?.prompt || 'Selected image'} ${selectedImage?.isGenerating ? '(updating...)' : ''}` : 
                'Type above to create a new image tile • Updates after you finish typing'
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
        className="absolute inset-0 pt-52"
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
            isOrganizing={isOrganizing}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
        {images.length} image{images.length !== 1 ? 's' : ''} on canvas
        {selectedImageId && ' • 1 selected'}
      </div>
    </div>
  );
} 