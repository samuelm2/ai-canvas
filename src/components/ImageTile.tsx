'use client';

import { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import Image from 'next/image';
import { CanvasImage } from '../types';

interface ImageTileProps {
  image: CanvasImage;
  onDrag: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExpand: (id: string) => void;
  isOrganizing: boolean;
}

export default function ImageTile({ image, onDrag, onDelete, onSelect, onDuplicate, onExpand, isOrganizing }: ImageTileProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef(null);

  // Calculate if controls should be shown (hover OR selected) AND not dragging
  const showControls = (isHovered || image.selected) && !isDragging;

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
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
        className="absolute group"
        style={{ 
          width: image.width, 
          height: image.height,
          zIndex: isDragging ? 'var(--z-dragged-image)' : Math.min(image.zIndex || 1, 999),
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
          className="drag-handle absolute inset-0 cursor-move" 
          style={{ zIndex: 'var(--z-drag-handle)' }}
          title="Drag to move"
        />
        
        {/* Image */}
        {image.displayState === 'ready' && image.src ? (
          <div className="relative w-full h-full">
            <Image
              src={image.src}
              alt={image.prompt || 'Generated image'}
              fill
              className={`object-cover rounded-lg transition-all duration-200 ${
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
              unoptimized
            />
          </div>
        ) : image.displayState === 'updating' && image.src ? (
          <div className="relative w-full h-full">
            <Image
              src={image.src}
              alt={image.prompt || 'Generated image'}
              fill
              className={`object-cover rounded-lg transition-all duration-200 ${
                isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-102'
              } ${image.selected ? 'ring-4 ring-blue-500' : ''} opacity-60`}
              draggable={false}
              onDragStart={(e) => e.preventDefault()} // Prevent image drag
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
              unoptimized
            />
          </div>
        ) : (
          <div className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center transition-transform duration-200 ${
            isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-102'
          } ${image.selected ? 'ring-4 ring-blue-500' : ''}`}>
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        )}
        
        {/* Small corner loading indicator */}
        {(image.displayState === 'loading' || image.displayState === 'updating') && (
          <div className="absolute top-2 left-2" style={{ zIndex: 'var(--z-image-controls)' }}>
            <div className="status-indicator">
              <div className="loading-spinner"></div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        {showControls && (
          <div className="absolute -top-2 -right-2 flex gap-1" style={{ zIndex: 'var(--z-image-controls)' }}>
            <button
              onClick={handleExpand}
              onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
              className="control-btn-purple"
              title="Expand into 4 variations"
            >
              !
            </button>
            <button
              onClick={handleDuplicate}
              onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
              className="control-btn-success"
              title="Duplicate image"
            >
              ⧉
            </button>
            <button
              onClick={handleDelete}
              onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
              className="control-btn-danger"
              title="Delete image"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Prompt tooltip */}
        {image.prompt && showControls && (
          <div className="tooltip absolute bottom-0 left-0 right-0">
            {image.prompt}
          </div>
        )}
      </div>
    </Draggable>
  );
} 