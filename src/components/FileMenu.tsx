import React, { useState } from 'react';
import { FileMenuStatus } from '../types';

interface FileMenuProps {
  imagesCount: number;
  fileMenuStatus: FileMenuStatus;
  lastSavedDocumentId: string | null;
  shareUrl: string | null;
  onSave: () => void;
  onSaveNewCopy: () => void;
  onCopyShareUrl: () => void;
}

export default function FileMenu({
  imagesCount,
  fileMenuStatus,
  lastSavedDocumentId,
  shareUrl,
  onSave,
  onSaveNewCopy,
  onCopyShareUrl,
}: FileMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSave = () => {
    onSave();
    setShowDropdown(false);
  };

  const handleSaveNewCopy = () => {
    onSaveNewCopy();
    setShowDropdown(false);
  };

  const handleCopyShareUrl = () => {
    onCopyShareUrl();
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          fileMenuStatus === 'saved' || fileMenuStatus === 'copied'
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {fileMenuStatus === 'saving' ? '💾 Saving...' : 
         fileMenuStatus === 'savingNewCopy' ? '📄 Saving New Copy...' : 
         fileMenuStatus === 'saved' ? '✅ Saved!' : 
         fileMenuStatus === 'copied' ? '✅ Copied!' :
         '📁 File Menu'}
        <span className="text-sm">▼</span>
      </button>
      
      {showDropdown && (
        <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-48">
          <button
            onClick={handleSave}
            disabled={imagesCount === 0 || (fileMenuStatus !== 'idle' && fileMenuStatus !== 'saved')}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded-t-lg ${
              imagesCount === 0 || (fileMenuStatus !== 'idle' && fileMenuStatus !== 'saved')
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700'
            }`}
          >
            <span>💾</span>
            <span>{fileMenuStatus === 'saving' ? 'Saving...' : fileMenuStatus === 'saved' ? 'Saved!' : 'Save'}</span>
          </button>
          
          {lastSavedDocumentId && (
            <button
              onClick={handleSaveNewCopy}
              disabled={imagesCount === 0 || fileMenuStatus === 'savingNewCopy'}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 ${
                imagesCount === 0 || fileMenuStatus === 'savingNewCopy'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700'
              }`}
            >
              <span>📄</span>
              <span>{fileMenuStatus === 'savingNewCopy' ? 'Saving New Copy...' : 'Save New Copy'}</span>
            </button>
          )}
          
          {shareUrl && (
            <button
              onClick={handleCopyShareUrl}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 text-gray-700 rounded-b-lg"
            >
              <span>🔗</span>
              <span>Copy Link</span>
            </button>
          )}
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 