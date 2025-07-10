import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createSafeErrorResponse } from '../../../lib/errors';

const FAI_API_URL = 'https://fal.run/fal-ai/flux/schnell';

/**
 * POST /api/generate-image
 * Generates an AI image based on a text prompt
 * 
 * @param {NextRequest} request - The incoming request containing the image prompt
 * @returns {Promise<NextResponse>} JSON response with the generated image URL
 * 
 * @description Generates an AI image using the Flux model from Fal.AI.
 * If no API key is configured, falls back to demo mode using placeholder images.
 * The endpoint validates the prompt, calls the AI service, and returns the image URL.
 * 
 * @example
 * Request body:
 * {
 *   "prompt": "A serene mountain landscape at sunset"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "imageUrl": "https://fal.run/generated-image-url"
 * }
 * 
 * @note In demo mode (no API key), returns random placeholder images from Picsum
 */
export async function POST(request: NextRequest) {
  try {
    // Add error handling for JSON parsing
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.FAI_API_KEY; // No NEXT_PUBLIC_ prefix!
    
    if (!apiKey) {
      console.log('No API key found, using demo mode');
      // Use demo image logic when no API key is available
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const imageUrl = `https://picsum.photos/512/512?random=${Math.floor(Math.random() * 1000)}`;
      
      return NextResponse.json({
        success: true,
        imageUrl,
      });
    }

    // Use real API when key is available
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
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.images && response.data.images.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: response.data.images[0].url,
      });
    } else {
      return NextResponse.json({ error: 'No images returned from API' }, { status: 500 });
    }
  } catch (error: unknown) {
    const safeError = createSafeErrorResponse(error, 'Failed to generate image', 'POST /api/generate-image');
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
} 