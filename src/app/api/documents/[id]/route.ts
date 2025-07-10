import { NextRequest, NextResponse } from 'next/server';
import { loadDocument, updateDocument } from '../../../../lib/database';
import { createSafeErrorResponse } from '../../../../lib/errors';

/**
 * GET /api/documents/[id]
 * Retrieves a document by its ID from the database
 * 
 * @param {NextRequest} request - The incoming request
 * @param {Object} context - Route context containing params
 * @param {Promise<{id: string}>} context.params - Route parameters with document ID
 * @returns {Promise<NextResponse>} JSON response with document data
 * 
 * @description Loads a specific document from the database by its UUID.
 * Validates the ID format and returns the document with its images and metadata.
 * 
 * @example
 * Request: GET /api/documents/123e4567-e89b-12d3-a456-426614174000
 * Response:
 * {
 *   "success": true,
 *   "document": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "title": "My Canvas",
 *     "images": [...],
 *     "createdAt": "2023-01-01T00:00:00.000Z"
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }

    // Load document from database
    const document = await loadDocument(id);

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: unknown) {
    const safeError = createSafeErrorResponse(error, 'Failed to load document', `GET /api/documents/${await params.then(p => p.id)}`);
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
}

/**
 * PUT /api/documents/[id]
 * Updates an existing document in the database
 * 
 * @param {NextRequest} request - The incoming request containing updated document data
 * @param {Object} context - Route context containing params
 * @param {Promise<{id: string}>} context.params - Route parameters with document ID
 * @returns {Promise<NextResponse>} JSON response with success status
 * 
 * @description Updates a document's title and images array in the database.
 * Validates the ID format and request body before updating.
 * 
 * @example
 * Request: PUT /api/documents/123e4567-e89b-12d3-a456-426614174000
 * Request body:
 * {
 *   "title": "Updated Canvas",
 *   "images": [...]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "documentId": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid document ID format' }, { status: 400 });
    }

    // Parse request body
    let body;
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

    // Update document in database
    await updateDocument(id, title, images);

    return NextResponse.json({
      success: true,
      documentId: id,
    });
  } catch (error: unknown) {
    const safeError = createSafeErrorResponse(error, 'Failed to update document', `PUT /api/documents/${await params.then(p => p.id)}`);
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
} 