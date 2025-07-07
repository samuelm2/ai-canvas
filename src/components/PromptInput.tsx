'use client';

import { useState } from 'react';

interface PromptInputProps {
  onGenerateImage: (prompt: string) => void;
  isGenerating: boolean;
}

export default function PromptInput({ onGenerateImage, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerateImage(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isGenerating}
      />
      <button
        type="submit"
        disabled={!prompt.trim() || isGenerating}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          !prompt.trim() || isGenerating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating...
          </div>
        ) : (
          'Generate'
        )}
      </button>
    </form>
  );
} 