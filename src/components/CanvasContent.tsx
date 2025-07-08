import React from 'react';
import ImageTile from './ImageTile';
import { CanvasImage } from '../types';

interface CanvasContentProps {
  images: CanvasImage[];
  onCanvasClick: (e: React.MouseEvent) => void;
  onImageDrag: (id: string, x: number, y: number) => void;
  onImageSelect: (id: string) => void;
  onImageDelete: (id: string) => void;
  onImageDuplicate: (id: string) => void;
  onImageExpand: (id: string) => void;
  isOrganizing: boolean;
}

export default function CanvasContent({
  images,
  onCanvasClick,
  onImageDrag,
  onImageSelect,
  onImageDelete,
  onImageDuplicate,
  onImageExpand,
  isOrganizing,
}: CanvasContentProps) {
  return (
    <div className="absolute top-52 left-0 right-0 bottom-0 overflow-auto">
      <div 
        className="relative min-w-full min-h-full"
        onClick={onCanvasClick}
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

        {/* Image Tiles */}
        {images.map((image) => (
          <ImageTile
            key={image.id}
            image={image}
            onDrag={onImageDrag}
            onDelete={onImageDelete}
            onSelect={onImageSelect}
            onDuplicate={onImageDuplicate}
            onExpand={onImageExpand}
            isOrganizing={isOrganizing}
          />
        ))}
      </div>
    </div>
  );
} 