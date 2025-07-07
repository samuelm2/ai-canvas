import axios from 'axios';
import { AIImageResponse } from '../types';

export class AIService {
  static async generateImage(prompt: string, abortSignal?: AbortSignal): Promise<AIImageResponse> {
    try {
      if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt is required and cannot be empty');
      }
      
      // Call our secure API route instead of external API directly
      const response = await axios.post(
        '/api/generate-image',
        { prompt: prompt.trim() },
        { 
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortSignal 
        }
      );

      return {
        success: true,
        imageUrl: response.data.imageUrl,
      };
    } catch (error: any) {
      // Handle cancellation gracefully
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      
      console.error('Error generating image:', error);
      
      let errorMessage = 'Failed to generate image';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Generate 4 prompt variations using our secure API route
  static async generatePromptVariations(originalPrompt: string, abortSignal?: AbortSignal): Promise<{ success: boolean; variations?: string[]; error?: string }> {
    try {
      if (!originalPrompt || originalPrompt.trim() === '') {
        throw new Error('Original prompt is required and cannot be empty');
      }
      
      // Call our secure API route instead of external API directly
      const response = await axios.post(
        '/api/generate-variations',
        { prompt: originalPrompt.trim() },
        { 
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortSignal 
        }
      );

      return {
        success: true,
        variations: response.data.variations,
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      
      console.error('Error generating prompt variations:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate variations',
      };
    }
  }

} 