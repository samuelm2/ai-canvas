'use client';

import { useState } from 'react';

interface PromptInputProps {
  onGenerateImage?: (prompt: string) => void;
  onChange?: (prompt: string) => void;
  isGenerating?: boolean;
  placeholder?: string;
  showSubmitButton?: boolean;
  value?: string;
  className?: string;
}

export default function PromptInput({ 
  onGenerateImage, 
  onChange, 
  isGenerating = false, 
  placeholder = "Describe the image you want to generate...",
  showSubmitButton = true,
  value: controlledValue,
  className = ""
}: PromptInputProps) {
  const [internalValue, setInternalValue] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const prompt = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Update internal state if not controlled
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating && onGenerateImage) {
      onGenerateImage(prompt.trim());
      
      // Clear input after submission if not controlled
      if (controlledValue === undefined) {
        setInternalValue('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 w-full max-w-2xl ${className}`}>
      <input
        type="text"
        value={prompt}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        disabled={isGenerating}
      />
      {showSubmitButton && (
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
      )}
    </form>
  );
} 