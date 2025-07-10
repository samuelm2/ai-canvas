import { Suspense } from 'react';
import ImageCanvas from '../components/ImageCanvas';

/**
 * Home page component - the main entry point of the application
 * Renders the AI Image Canvas with a loading fallback
 * 
 * @returns {JSX.Element} The home page with suspense boundary and image canvas
 */
export default function Home() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Canvas...</p>
        </div>
      </div>
    }>
      <ImageCanvas />
    </Suspense>
  );
}
