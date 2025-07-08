import React, { useState } from 'react';
import PromptInput from './PromptInput';
import ShareModal from './ShareModal';
import { CanvasImage, SaveState } from '../types';

interface CanvasHeaderProps {
  currentPrompt: string;
  onPromptChange: (prompt: string) => void;
  selectedImage: CanvasImage | undefined;
  onOrganizeGrid: () => void;
  onClearCanvas: () => void;
  imagesCount: number;
  onSaveDocument: (title?: string, forceNew?: boolean) => Promise<{ documentId: string; shareUrl: string } | null>;
  onCopyShareUrl: () => Promise<boolean>;
  saveState: SaveState;
  shareUrl: string | null;
  lastSavedDocumentId: string | null;
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
  saveState,
  shareUrl,
  lastSavedDocumentId,
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
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={handleSave}
            disabled={imagesCount === 0 || (saveState !== 'idle' && saveState !== 'saved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              imagesCount === 0 || (saveState !== 'idle' && saveState !== 'saved')
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : saveState === 'saved'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {saveState === 'saving' ? '💾 Saving...' : saveState === 'saved' ? '✅ Saved!' : '💾 Save'}
          </button>

          {lastSavedDocumentId && (
            <button
              onClick={handleSaveNewCopy}
              disabled={imagesCount === 0 || saveState === 'savingNewCopy'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                imagesCount === 0 || saveState === 'savingNewCopy'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {saveState === 'savingNewCopy' ? '📄 Saving New Copy...' : '📄 Save New Copy'}
            </button>
          )}
          
          {shareUrl && (
            <button
              onClick={onCopyShareUrl}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-purple-500 hover:bg-purple-600 text-white"
            >
              🔗 Copy Link
            </button>
          )}
          
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