'use client';

import { useState } from 'react';

export default function ErrorTester() {
  const [shouldError, setShouldError] = useState(false);

  // Simple error test
  if (shouldError) {
    throw new Error('Simple test error - this should be caught by the error boundary');
  }

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 p-4 rounded-lg max-w-xs">
      <h3 className="font-bold text-red-800 mb-2">🧪 Error Boundary Test</h3>
      <p className="text-red-600 text-sm mb-3">
        Click to test error boundary:
      </p>
      <button
        onClick={() => setShouldError(true)}
        className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-sm rounded"
      >
        💥 Throw Simple Error
      </button>
    </div>
  );
} 