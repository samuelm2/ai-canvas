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
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 