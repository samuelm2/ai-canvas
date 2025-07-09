import { Suspense } from 'react';
import ImageCanvas from '../components/ImageCanvas';

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
