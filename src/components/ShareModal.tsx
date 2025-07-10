'use client';

import React, { useState } from 'react';

/**
 * Props for the ShareModal component
 * 
 * @interface ShareModalProps
 * @property {boolean} isOpen - Whether the modal is currently open
 * @property {function} onClose - Callback to close the modal
 * @property {string} shareUrl - The URL to share
 * @property {function} onCopyUrl - Callback to copy the share URL to clipboard
 */
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onCopyUrl: () => Promise<boolean>;
}

/**
 * ShareModal - Modal component for sharing saved canvas documents
 * 
 * @param {ShareModalProps} props - Component props
 * @returns {JSX.Element | null} The share modal or null if not open
 * 
 * @description A modal component that appears after successfully saving a canvas
 * to display the share URL and provide copy functionality. Features:
 * - Success message with celebration emoji
 * - Formatted share URL display
 * - Copy-to-clipboard functionality with visual feedback
 * - Close button to dismiss the modal
 * 
 * @example
 * <ShareModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   shareUrl="https://example.com/canvas/123"
 *   onCopyUrl={() => copyToClipboard()}
 * />
 */
export default function ShareModal({ isOpen, onClose, shareUrl, onCopyUrl }: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyUrl = async () => {
    const success = await onCopyUrl();
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="header-title text-lg mb-4">Canvas Saved Successfully! 🎉</h3>
        <p className="text-gray-600 mb-4">
          Your canvas has been saved and can be shared with this link:
        </p>
        <div className="bg-gray-100 p-3 rounded-lg mb-4 overflow-x-auto text-sm text-gray-700 font-mono whitespace-nowrap">
          {shareUrl}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCopyUrl}
            className={copySuccess ? 'btn-success' : 'btn-primary'}
          >
            {copySuccess ? '✅ Copied!' : '📋 Copy Link'}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 