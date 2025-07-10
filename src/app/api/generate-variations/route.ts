import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createSafeErrorResponse } from '../../../lib/errors';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * POST /api/generate-variations
 * Generates creative variations of an image prompt using OpenAI's GPT model
 * 
 * @param {NextRequest} request - The incoming request containing the base prompt
 * @returns {Promise<NextResponse>} JSON response with 4 prompt variations
 * 
 * @description Uses OpenAI's GPT model to generate 4 creative variations of a given
 * image prompt. Each variation explores different artistic styles, moods, or creative
 * interpretations while maintaining the core subject matter.
 * If no API key is configured, falls back to demo variations with predefined styles.
 * 
 * @example
 * Request body:
 * {
 *   "prompt": "A cat sitting on a windowsill"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "variations": [
 *     "A cat sitting on a windowsill, artistic oil painting style",
 *     "A cat sitting on a windowsill, cyberpunk neon aesthetic",
 *     "A cat sitting on a windowsill, watercolor illustration",
 *     "A cat sitting on a windowsill, minimalist black and white photography"
 *   ]
 * }
 * 
 * @note In demo mode (no API key), returns predefined style variations
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

    const apiKey = process.env.OPENAI_API_KEY; // No NEXT_PUBLIC_ prefix!
    
    if (!apiKey) {
      // Fallback to demo variations if no API key
      const demoVariations = [
        `${prompt}, artistic oil painting style`,
        `${prompt}, cyberpunk neon aesthetic`,
        `${prompt}, watercolor illustration`,
        `${prompt}, minimalist black and white photography`
      ];
      
      return NextResponse.json({
        success: true,
        variations: demoVariations,
      });
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a creative AI assistant that generates image prompt variations. Given an original image prompt, create 4 different variations that explore different artistic styles, moods, or creative interpretations while maintaining the core subject matter. Each variation should be distinct and creative. Return your response as a JSON object with a "variations" array containing exactly 4 strings.'
          },
          {
            role: 'user',
            content: `Create 4 creative variations of this image prompt: "${prompt}"\n\nReturn a JSON object with this structure: {"variations": ["variation1", "variation2", "variation3", "variation4"]}`
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI API' }, { status: 500 });
    }

    // Parse JSON response
    let apiResponse;
    try {
      apiResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI JSON response:', parseError);
      return NextResponse.json({ error: 'Invalid JSON response from OpenAI' }, { status: 500 });
    }

    let variations = apiResponse.variations || [];
    
    // Ensure we have exactly 4 variations
    if (!Array.isArray(variations) || variations.length < 4) {
      // Pad with demo variations if needed
      const demoVariations = [
        `${prompt}, artistic oil painting style`,
        `${prompt}, cyberpunk neon aesthetic`,
        `${prompt}, watercolor illustration`,
        `${prompt}, minimalist black and white photography`
      ];
      const additionalVariations = demoVariations.slice(0, 4 - variations.length);
      variations.push(...additionalVariations);
    }

    // Ensure we only return 4 variations
    variations = variations.slice(0, 4);

    return NextResponse.json({
      success: true,
      variations,
    });
  } catch (error: unknown) {
    const safeError = createSafeErrorResponse(error, 'Failed to generate variations', 'POST /api/generate-variations');
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
} 