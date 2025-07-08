import React, { useState } from 'react';
import PromptInput from './PromptInput';
import { CanvasImage } from '../types';

interface CanvasHeaderProps {
  currentPrompt: string;
  onPromptChange: (prompt: string) => void;
  selectedImage: CanvasImage | undefined;
  onOrganizeGrid: () => void;
  onClearCanvas: () => void;
  imagesCount: number;
  onSaveDocument: (title?: string, forceNew?: boolean) => Promise<{ documentId: string; shareUrl: string } | null>;
  onCopyShareUrl: () => Promise<boolean>;
  isSaving: boolean;
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
  isSaving,
  shareUrl,
  lastSavedDocumentId,
}: CanvasHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSave = async () => {
    const result = await onSaveDocument(undefined, false);
    if (result) {
      setShowShareModal(true);
    }
  };

  const handleSaveNewCopy = async () => {
    const result = await onSaveDocument(undefined, true);
    if (result) {
      setShowShareModal(true);
    }
  };

  const handleCopyUrl = async () => {
    const success = await onCopyShareUrl();
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
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
            disabled={imagesCount === 0 || isSaving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              imagesCount === 0 || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isSaving ? '💾 Saving...' : '💾 Save'}
          </button>

          {lastSavedDocumentId && (
            <button
              onClick={handleSaveNewCopy}
              disabled={imagesCount === 0 || isSaving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                imagesCount === 0 || isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              📄 Save New Copy
            </button>
          )}
          
          {shareUrl && (
            <button
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {copySuccess ? '✅ Copied!' : '🔗 Copy Link'}
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
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Canvas Saved Successfully! 🎉</h3>
            <p className="text-gray-600 mb-4">
              Your canvas has been saved and can be shared with this link:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all text-sm text-gray-700 font-mono">
              {shareUrl}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  copySuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copySuccess ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 