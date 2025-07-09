'use client';

import { useState } from 'react';

interface ErrorTesterProps {
  onTestError: (error: string | null) => void;
}

export default function ErrorTester({ onTestError }: ErrorTesterProps) {
  const [shouldError, setShouldError] = useState(false);

  // Simple error test
  if (shouldError) {
    throw new Error('Simple test error - this should be caught by the error boundary');
  }

  const testErrorModal = () => {
    onTestError('Test error modal - this should show the error modal (not error boundary)');
  };

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 p-4 rounded-lg max-w-xs" style={{ zIndex: 'var(--z-alerts)' }}>
      <h3 className="font-bold text-red-800 mb-2">🧪 Error Tests</h3>
      <div className="space-y-2">
        <div>
          <p className="text-red-600 text-xs mb-1">Test error boundary:</p>
          <button
            onClick={() => setShouldError(true)}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs rounded"
          >
            💥 Throw Error
          </button>
        </div>
        <div>
          <p className="text-red-600 text-xs mb-1">Test error modal:</p>
          <button
            onClick={testErrorModal}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 text-xs rounded"
          >
            ⚠️ Show Error Modal
          </button>
        </div>
      </div>
    </div>
  );
} 