'use client';

import React, { useState } from 'react';
import PromptInput from './PromptInput';
import ShareModal from './ShareModal';
import FileMenu from './FileMenu';
import { CanvasImage, FileMenuStatus } from '../types';
import ErrorTester from './ErrorTester';

interface CanvasHeaderProps {
  currentPrompt: string;
  onPromptChange: (prompt: string) => void;
  selectedImage: CanvasImage | undefined;
  onOrganizeGrid: () => void;
  onClearCanvas: () => void;
  imagesCount: number;
  onSaveDocument: (title?: string, forceNew?: boolean) => Promise<{ documentId: string; shareUrl: string } | null>;
  onCopyShareUrl: () => Promise<boolean>;
  fileMenuStatus: FileMenuStatus;
  shareUrl: string | null;
  lastSavedDocumentId: string | null;
  isLoadingDocument: boolean;
}

export default function CanvasHeader({
  currentPrompt,
  onPromptChange,
  selectedImage,
  onOrganizeGrid,
  onClearCanvas,
  imagesCount,
  onSaveDocument,
  onCopyShareUrl,
  fileMenuStatus,
  shareUrl,
  lastSavedDocumentId,
  isLoadingDocument,
}: CanvasHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSave = async () => {
    const result = await onSaveDocument(undefined, false);
    if (result) {
      // Only show modal for first save (when there was no existing document)
      if (!lastSavedDocumentId) {
        setShowShareModal(true);
      }
    }
  };

  const handleSaveNewCopy = async () => {
    const result = await onSaveDocument(undefined, true);
    if (result) {
      // Always show modal for new copies (new share URL)
      setShowShareModal(true);
    }
  };


  return (
    <div className="header absolute top-0 left-0 right-0" style={{ zIndex: 'var(--z-header)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center flex items-center gap-3">
          <h1 className="header-title">AI Image Canvas</h1>
          {isLoadingDocument && (
            <div className="flex items-center gap-2">
              <div className="status-indicator">
                <div className="loading-spinner"></div>
              </div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          )}
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
              `Live editing: ${selectedImage?.prompt || 'Selected image'} ${selectedImage?.displayState === 'updating' || selectedImage?.displayState === 'loading' ? '(updating...)' : ''}` : 
              'Type above to create a new image tile'
            }
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && <ErrorTester />}
        {/* Controls */}
        <div className="flex gap-2 flex-wrap justify-center">
          <FileMenu
            imagesCount={imagesCount}
            fileMenuStatus={fileMenuStatus}
            lastSavedDocumentId={lastSavedDocumentId}
            shareUrl={shareUrl}
            onSave={handleSave}
            onSaveNewCopy={handleSaveNewCopy}
            onCopyShareUrl={onCopyShareUrl}
          />
          
          <button
            onClick={onOrganizeGrid}
            disabled={imagesCount === 0}
            className={imagesCount === 0 ? 'btn-disabled' : 'btn-purple'}
          >
            📐 Organize Grid
          </button>
          <button
            onClick={onClearCanvas}
            disabled={imagesCount === 0}
            className={imagesCount === 0 ? 'btn-disabled' : 'btn-danger'}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
      
      {/* Share Modal */}
      {shareUrl && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={shareUrl}
          onCopyUrl={onCopyShareUrl}
        />
      )}
    </div>
  );
} 