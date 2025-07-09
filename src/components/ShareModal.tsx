'use client';

import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onCopyUrl: () => Promise<boolean>;
}

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
        <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all text-sm text-gray-700 font-mono">
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