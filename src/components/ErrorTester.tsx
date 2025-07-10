'use client';

import { useState } from 'react';

/**
 * Props for the ErrorTester component
 * 
 * @interface ErrorTesterProps
 * @property {function} onTestError - Callback function to trigger error modal display
 */
interface ErrorTesterProps {
  onTestError: (error: string | null) => void;
}

/**
 * ErrorTester - Development-only component for testing error handling
 * 
 * @param {ErrorTesterProps} props - Component props
 * @returns {JSX.Element} A floating panel with error testing buttons
 * 
 * @description A development utility component that provides buttons to test
 * different types of error scenarios in the application. It allows testing:
 * - Error boundary functionality (component-level errors)
 * - Error modal display (user-facing error messages)
 * - Error handling flows and user experience
 * 
 * @example
 * {process.env.NODE_ENV === 'development' && (
 *   <ErrorTester onTestError={(error) => setErrorMessage(error)} />
 * )}
 * 
 * @note This component should only be rendered in development mode
 */
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