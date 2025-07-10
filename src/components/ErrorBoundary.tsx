'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Props for the ErrorBoundary component
 * 
 * @interface Props
 * @property {ReactNode} children - Child components to render when no error occurs
 * @property {ReactNode} [fallback] - Optional custom fallback UI to display when an error occurs
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 * 
 * @interface State
 * @property {boolean} hasError - Whether an error has been caught by the boundary
 */
interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary - React error boundary component for catching and handling errors
 * 
 * @class ErrorBoundary
 * @extends {Component<Props, State>}
 * 
 * @description A React error boundary that catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI instead of crashing the entire app.
 * It provides a graceful error handling experience with options for:
 * - Custom fallback UI
 * - Default error message with reload option
 * - Development-only error logging
 * 
 * @example
 * // With default fallback
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorComponent />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @note This component only catches errors in the component tree below it,
 * not in event handlers or asynchronous code.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Simple logging - only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              The AI Canvas hit an unexpected error.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                🔃 Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 