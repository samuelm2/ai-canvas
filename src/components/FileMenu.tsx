'use client';

import React, { useState } from 'react';
import { FileMenuStatus } from '../types';

/**
 * Props for the FileMenu component
 * 
 * @interface FileMenuProps
 * @property {number} imagesCount - Number of images currently on the canvas
 * @property {FileMenuStatus} fileMenuStatus - Current status of file operations
 * @property {string | null} lastSavedDocumentId - ID of the last saved document
 * @property {string | null} shareUrl - URL for sharing the saved document
 * @property {function} onSave - Callback to save the current canvas
 * @property {function} onSaveNewCopy - Callback to save a new copy of the canvas
 * @property {function} onCopyShareUrl - Callback to copy the share URL to clipboard
 */
interface FileMenuProps {
  imagesCount: number;
  fileMenuStatus: FileMenuStatus;
  lastSavedDocumentId: string | null;
  shareUrl: string | null;
  onSave: () => void;
  onSaveNewCopy: () => void;
  onCopyShareUrl: () => void;
}

/**
 * FileMenu - Dropdown menu component for file operations
 * 
 * @param {FileMenuProps} props - Component props
 * @returns {JSX.Element} A dropdown menu with file operation buttons
 * 
 * @description A dropdown menu component that provides file operations for
 * the canvas including save, save new copy, and copy share URL. Features:
 * - Dynamic button states based on operation status
 * - Conditional menu items based on document state
 * - Visual feedback for ongoing operations
 * - Click-outside-to-close functionality
 * 
 * @example
 * <FileMenu
 *   imagesCount={5}
 *   fileMenuStatus="idle"
 *   lastSavedDocumentId="doc-123"
 *   shareUrl="https://example.com/canvas/123"
 *   onSave={() => saveCanvas()}
 *   onSaveNewCopy={() => saveNewCopy()}
 *   onCopyShareUrl={() => copyUrl()}
 * />
 */
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