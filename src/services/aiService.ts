import axios from 'axios';
import { AIImageResponse, AxiosErrorResponse, AIPromptVariationsResponse } from '../types';

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
    } catch (error: unknown) {
      // Handle cancellation gracefully
      if (error instanceof Error && (error.name === 'AbortError' || (error as any).code === 'ERR_CANCELED')) {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      
      console.error('Error generating image:', error);
      
      let errorMessage = 'Failed to generate image';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Generate 4 prompt variations using our secure API route
  static async generatePromptVariations(originalPrompt: string, abortSignal?: AbortSignal): Promise<AIPromptVariationsResponse> {
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
    } catch (error: unknown) {
      if (error instanceof Error && (error.name === 'AbortError' || (error as any).code === 'ERR_CANCELED')) {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      
      console.error('Error generating prompt variations:', error);
      
      let errorMessage = 'Failed to generate variations';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

} 