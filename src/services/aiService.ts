import axios, { isAxiosError } from 'axios';
import { AIImageResponse, PromptVariationsResponse } from '../types';
import { extractErrorMessage } from '../utils/errorUtils';

/**
 * AIService - Service class for handling AI-powered image generation operations
 * 
 * @class AIService
 * 
 * @description Provides static methods for interacting with AI services to generate
 * images and prompt variations. Acts as an abstraction layer between the frontend
 * and the backend API routes, handling error management, request cancellation,
 * and response formatting.
 * 
 * @example
 * // Generate an image
 * const result = await AIService.generateImage("A beautiful sunset");
 * if (result.success) {
 *   console.log("Generated image URL:", result.imageUrl);
 * }
 * 
 * // Generate prompt variations
 * const variations = await AIService.generatePromptVariations("A cat");
 * if (variations.success) {
 *   console.log("Variations:", variations.variations);
 * }
 */
export class AIService {
  /**
   * Generate an AI image based on a text prompt
   * 
   * @param {string} prompt - The text prompt describing the desired image
   * @param {AbortSignal} [abortSignal] - Optional signal to cancel the request
   * @returns {Promise<AIImageResponse>} Response containing the generated image URL or error
   * 
   * @description Generates an AI image using the provided prompt by calling the
   * backend API route. Handles request validation, cancellation, and error management.
   * 
   * @example
   * const controller = new AbortController();
   * const result = await AIService.generateImage(
   *   "A serene mountain landscape at sunset",
   *   controller.signal
   * );
   * 
   * if (result.success) {
   *   console.log("Image generated:", result.imageUrl);
   * } else {
   *   console.error("Generation failed:", result.error);
   * }
   */
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
      if (
        (error instanceof Error && error.name === 'AbortError') ||
        (isAxiosError(error) && error.code === 'ERR_CANCELED')
      ) {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      
      console.error('Error generating image:', error);
      
      const errorMessage = extractErrorMessage(error, 'Failed to generate image');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate creative variations of a prompt for image expansion
   * 
   * @param {string} originalPrompt - The original prompt to create variations from
   * @param {AbortSignal} [abortSignal] - Optional signal to cancel the request
   * @returns {Promise<PromptVariationsResponse>} Response containing 4 prompt variations or error
   * 
   * @description Generates 4 creative variations of the provided prompt using AI.
   * Each variation explores different artistic styles, moods, or creative interpretations
   * while maintaining the core subject matter.
   * 
   * @example
   * const result = await AIService.generatePromptVariations(
   *   "A cat sitting by a window"
   * );
   * 
   * if (result.success) {
   *   result.variations.forEach((variation, index) => {
   *     console.log(`Variation ${index + 1}: ${variation}`);
   *   });
   * } else {
   *   console.error("Variation generation failed:", result.error);
   * }
   */
  static async generatePromptVariations(originalPrompt: string, abortSignal?: AbortSignal): Promise<PromptVariationsResponse> {
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
      if (
        (error instanceof Error && error.name === 'AbortError') ||
        (isAxiosError(error) && error.code === 'ERR_CANCELED')
      ) {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      
      console.error('Error generating prompt variations:', error);
      
      const errorMessage = extractErrorMessage(error, 'Failed to generate variations');
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

} 