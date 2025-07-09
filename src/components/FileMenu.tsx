'use client';

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

  const getButtonClass = () => {
    if (fileMenuStatus === 'saved' || fileMenuStatus === 'copied') {
      return 'btn-success flex items-center gap-2';
    }
    return 'btn-primary flex items-center gap-2';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={getButtonClass()}
      >
        {fileMenuStatus === 'saving' ? '💾 Saving...' : 
         fileMenuStatus === 'savingNewCopy' ? '📄 Saving New Copy...' : 
         fileMenuStatus === 'saved' ? '✅ Saved!' : 
         fileMenuStatus === 'copied' ? '✅ Copied!' :
         '📁 File Menu'}
        <span className="text-sm">▼</span>
      </button>
      
      {showDropdown && (
        <div className="dropdown-menu">
          <button
            onClick={handleSave}
            disabled={imagesCount === 0 || (fileMenuStatus !== 'idle' && fileMenuStatus !== 'saved')}
            className={
              imagesCount === 0 || (fileMenuStatus !== 'idle' && fileMenuStatus !== 'saved')
                ? 'dropdown-item-disabled rounded-t-lg'
                : 'dropdown-item rounded-t-lg'
            }
          >
            <span>💾</span>
            <span>{fileMenuStatus === 'saving' ? 'Saving...' : fileMenuStatus === 'saved' ? 'Saved!' : 'Save'}</span>
          </button>
          
          {lastSavedDocumentId && (
            <button
              onClick={handleSaveNewCopy}
              disabled={imagesCount === 0 || fileMenuStatus === 'savingNewCopy'}
              className={
                imagesCount === 0 || fileMenuStatus === 'savingNewCopy'
                  ? 'dropdown-item-disabled border-t border-gray-100'
                  : 'dropdown-item border-t border-gray-100'
              }
            >
              <span>📄</span>
              <span>{fileMenuStatus === 'savingNewCopy' ? 'Saving New Copy...' : 'Save New Copy'}</span>
            </button>
          )}
          
          {shareUrl && (
            <button
              onClick={handleCopyShareUrl}
              className="dropdown-item border-t border-gray-100 rounded-b-lg"
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
          className="fixed inset-0"
          style={{ zIndex: 'var(--z-dropdown-bg)' }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 