import React from 'react';
import PromptInput from './PromptInput';
import { CanvasImage } from '../types';

interface CanvasHeaderProps {
  currentPrompt: string;
  onPromptChange: (prompt: string) => void;
  selectedImage: CanvasImage | undefined;
  onOrganizeGrid: () => void;
  onClearCanvas: () => void;
  imagesCount: number;
}

export default function CanvasHeader({
  currentPrompt,
  onPromptChange,
  selectedImage,
  onOrganizeGrid,
  onClearCanvas,
  imagesCount,
}: CanvasHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-sm p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">AI Image Canvas</h1>
        </div>
        
        {/* Live Prompt Input */}
        <div className="w-full max-w-2xl">
          <PromptInput 
            value={currentPrompt}
            onChange={onPromptChange}
            placeholder={selectedImage ? "Edit prompt to live-update selected image..." : "Type to create a new image..."}
            className="mb-2"
          />
          <div className="text-xs text-gray-500 text-center">
            {selectedImage ? 
              `Live editing: ${selectedImage?.prompt || 'Selected image'} ${selectedImage?.loadingState === 'waitingOnAPI' || selectedImage?.loadingState === 'urlLoading' ? '(updating...)' : ''}` : 
              'Type above to create a new image tile'
            }
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={onOrganizeGrid}
            disabled={imagesCount === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              imagesCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            📐 Organize Grid
          </button>
          <button
            onClick={onClearCanvas}
            disabled={imagesCount === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              imagesCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
    </div>
  );
} 