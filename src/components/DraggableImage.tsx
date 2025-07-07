'use client';

import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { CanvasImage, ImageLoadingState } from '../types';

interface DraggableImageProps {
  image: CanvasImage;
  onDrag: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExpand: (id: string) => void;
  onImageLoad: (id: string) => void;
  isOrganizing: boolean;
}

export default function DraggableImage({ image, onDrag, onDelete, onSelect, onDuplicate, onExpand, onImageLoad, isOrganizing }: DraggableImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef(null);

  // Calculate if controls should be shown (hover OR selected) AND not dragging
  const showControls = (isHovered || image.selected) && !isDragging;

  const handleDrag = (e: any, data: any) => {
    onDrag(image.id, data.x, data.y);
  };

  const handleStart = () => {
    setIsDragging(true);
    // Select image when starting to drag
    onSelect(image.id);
    // Controls will be hidden by the conditional render (!isDragging)
  };

  const handleStop = () => {
    setIsDragging(false);
    // Controls will reappear automatically based on hover state
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(image.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(image.id);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand(image.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(image.id);
  };

  const handleImageLoad = () => {
    onImageLoad(image.id);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: image.x, y: image.y }}
      onDrag={handleDrag}
      onStart={handleStart}
      onStop={handleStop}
      handle=".drag-handle"
    >
      <div 
        ref={nodeRef}
        className={`absolute group ${isDragging ? 'z-50' : 'z-10'}`}
        style={{ 
          width: image.width, 
          height: image.height,
          // Only add transition during grid organization, not during normal dragging
          transition: isOrganizing ? 'transform 0.5s ease-out' : 'none',
          // Prevent text/image selection
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Drag Handle */}
        <div 
          className="drag-handle absolute inset-0 cursor-move z-20" 
          title="Drag to move"
        />
        
        {/* Image */}
        {image.src && image.loadingState === 'finished' ? (
          <img
            src={image.src}
            alt={image.prompt || 'Generated image'}
            className={`w-full h-full object-cover rounded-lg transition-transform duration-200 ${
              isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-102'
            } ${image.selected ? 'ring-4 ring-blue-500' : ''}`}
            draggable={false}
            onDragStart={(e) => e.preventDefault()} // Prevent image drag
            style={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center transition-transform duration-200 ${
            isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-102'
          } ${image.selected ? 'ring-4 ring-blue-500' : ''}`}>
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-sm">
                {image.loadingState === 'waitingOnAPI' ? 'Generating...' : 
                 image.loadingState === 'urlLoading' ? 'Loading...' : 
                 'Loading...'}
              </p>
            </div>
          </div>
        )}
        
        {/* Image with loading detection */}
        {image.src && image.loadingState === 'urlLoading' && (
          <img
            src={image.src}
            onLoad={handleImageLoad}
            style={{ display: 'none' }}
            alt=""
          />
        )}
        
        {/* Small corner loading indicator */}
        {(image.loadingState === 'waitingOnAPI' || image.loadingState === 'urlLoading') && (
          <div className="absolute top-2 left-2 z-30">
            <div className="bg-blue-500 bg-opacity-90 rounded-full p-1.5 shadow-lg">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        {showControls && (
          <div className="absolute -top-2 -right-2 flex gap-1 z-30">
            <button
              onClick={handleExpand}
              onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-colors"
              title="Expand into 4 variations"
            >
              !
            </button>
            <button
              onClick={handleDuplicate}
              onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
              className="bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-colors"
              title="Duplicate image"
            >
              ⧉
            </button>
            <button
              onClick={handleDelete}
              onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-colors"
              title="Delete image"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Prompt tooltip */}
        {image.prompt && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
            {image.prompt}
          </div>
        )}
      </div>
    </Draggable>
  );
} 