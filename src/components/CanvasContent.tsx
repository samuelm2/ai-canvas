'use client';

import React from 'react';
import ImageTile from './ImageTile';
import { CanvasImage } from '../types';

/**
 * Props for the CanvasContent component
 * 
 * @interface CanvasContentProps
 * @property {CanvasImage[]} images - Array of image tiles to display on the canvas
 * @property {function} onCanvasClick - Callback for when the canvas background is clicked
 * @property {function} onImageDrag - Callback for when an image is dragged to a new position
 * @property {function} onImageSelect - Callback for when an image is selected
 * @property {function} onImageDelete - Callback for when an image is deleted
 * @property {function} onImageDuplicate - Callback for when an image is duplicated
 * @property {function} onImageExpand - Callback for when an image is expanded into variations
 * @property {boolean} isOrganizing - Whether the canvas is currently organizing images in a grid
 */
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

/**
 * CanvasContent - Main scrollable area containing all image tiles
 * 
 * @param {CanvasContentProps} props - Component props
 * @returns {JSX.Element} The canvas content area with image tiles and interactions
 * 
 * @description The main content area of the canvas where image tiles are displayed
 * and managed. It provides a scrollable workspace with:
 * - Grid guidelines for visual alignment
 * - Empty state with instructions
 * - Image tile positioning and interactions
 * - Click handling for canvas background
 * 
 * @example
 * <CanvasContent
 *   images={canvasImages}
 *   onCanvasClick={(e) => handleCanvasClick(e)}
 *   onImageDrag={(id, x, y) => moveImage(id, x, y)}
 *   onImageSelect={(id) => selectImage(id)}
 *   onImageDelete={(id) => deleteImage(id)}
 *   onImageDuplicate={(id) => duplicateImage(id)}
 *   onImageExpand={(id) => expandImage(id)}
 *   isOrganizing={false}
 * />
 */
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