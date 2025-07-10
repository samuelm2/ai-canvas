import { NextRequest, NextResponse } from 'next/server';
import { saveDocument, initializeDatabase } from '../../../lib/database';
import { SaveDocumentRequest } from '../../../types';
import { createSafeErrorResponse } from '../../../lib/errors';

/**
 * POST /api/documents
 * Saves a new document with images to the database
 * 
 * @param {NextRequest} request - The incoming request containing document data
 * @returns {Promise<NextResponse>} JSON response with success status and document ID
 * 
 * @description Handles saving a new document with title and images array.
 * The endpoint initializes the database schema if needed, validates the request body,
 * and saves the document to the database.
 * 
 * @example
 * Request body:
 * {
 *   "title": "My Canvas",
 *   "images": [
 *     {
 *       "id": "image1",
 *       "url": "https://example.com/image1.jpg",
 *       "position": { "x": 100, "y": 200 }
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "documentId": "uuid-string"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database schema if needed
    await initializeDatabase();
    
    // Parse request body
    let body: SaveDocumentRequest;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { title, images } = body;
    
    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Images array is required' }, { status: 400 });
    }

    // Save document to database
    const documentId = await saveDocument(title, images);

    return NextResponse.json({
      success: true,
      documentId,
    });
  } catch (error: unknown) {
    const safeError = createSafeErrorResponse(error, 'Failed to save document', 'POST /api/documents');
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
} 