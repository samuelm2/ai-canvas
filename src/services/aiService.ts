import axios from 'axios';
import { AIImageResponse } from '../types';

const FAI_API_URL = 'https://fal.run/fal-ai/flux/schnell';

export class AIService {
  private static apiKey = process.env.NEXT_PUBLIC_FAI_API_KEY || '';

  static async generateImage(prompt: string): Promise<AIImageResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('FAI API key is not configured');
      }

      const response = await axios.post(
        FAI_API_URL,
        {
          prompt,
          image_size: 'square_hd',
          num_images: 1,
          enable_safety_checker: true,
        },
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.images && response.data.images.length > 0) {
        return {
          success: true,
          imageUrl: response.data.images[0].url,
        };
      } else {
        throw new Error('No images returned from API');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      let errorMessage = 'Failed to generate image';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Fallback method for development/demo purposes
  static async generateDemoImage(prompt: string): Promise<AIImageResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a placeholder image from Unsplash based on prompt keywords
    const keywords = prompt.toLowerCase().split(' ').join(',');
    const imageUrl = `https://picsum.photos/512/512?random=${Math.floor(Math.random() * 1000)}`;
    
    return {
      success: true,
      imageUrl,
    };
  }
} 