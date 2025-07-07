'use client';

import { useState, useCallback, useEffect } from 'react';
import DraggableImage from './DraggableImage';
import PromptInput from './PromptInput';
import { CanvasImage, GridConfig } from '../types';
import { AIService } from '../services/aiService';

export default function ImageCanvas() {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);
  
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

  // Handle image generation
  const handleGenerateImage = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Use demo mode if no API key is available
      const result = useDemoMode 
        ? await AIService.generateDemoImage(prompt)
        : await AIService.generateImage(prompt);
      
      if (result.success && result.imageUrl) {
        // Only create the image object when we have a valid src
        const newImage: CanvasImage = {
          id: generateId(),
          src: result.imageUrl,
          x: 100 + Math.random() * 200,
          y: 200 + Math.random() * 200,
          width: 256,
          height: 256,
          prompt,
        };
        
        setImages(prev => [...prev, newImage]);
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsGenerating(false);
    }
  }, [useDemoMode]);

  // Handle image dragging
  const handleImageDrag = useCallback((id: string, x: number, y: number) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, x, y } : img
    ));
  }, []);

  // Handle image deletion
  const handleImageDelete = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Organize images in a grid
  const organizeInGrid = useCallback(() => {
    // Use the original image size to calculate grid spacing
    const standardSize = 256;
    
    // Start organizing animation
    setIsOrganizing(true);
    
    setImages(prev => prev.map((img, index) => {
      const row = Math.floor(index / gridConfig.columns);
      const col = index % gridConfig.columns;
      
      return {
        ...img,
        x: gridConfig.startX + col * (standardSize + gridConfig.gap),
        y: gridConfig.startY + row * (standardSize + gridConfig.gap),
        // Preserve original dimensions - don't force resize
        // width: img.width,  // Keep original width
        // height: img.height, // Keep original height
      };
    }));
    
    // End organizing animation after transition completes
    setTimeout(() => setIsOrganizing(false), 500);
  }, [images, gridConfig]);

  // Clear all images
  const clearCanvas = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  // Dismiss error
  const dismissError = useCallback(() => {
    setError(null);
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
          <PromptInput onGenerateImage={handleGenerateImage} isGenerating={isGenerating} />
          
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
        <div className="absolute top-32 left-4 right-4 z-30 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
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
      <div className="absolute inset-0 pt-40">
        {/* Grid Guidelines (subtle) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-gray-300" />
            ))}
          </div>
        </div>

        {/* Instructions */}
        {images.length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-xl font-semibold mb-2">Create Your First Image</h2>
              <p className="text-sm">Enter a prompt above to generate an AI image</p>
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
            isOrganizing={isOrganizing}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
        {images.length} image{images.length !== 1 ? 's' : ''} on canvas
      </div>
    </div>
  );
} 