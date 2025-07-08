import { NextRequest, NextResponse } from 'next/server';
import { loadDocument, updateDocument } from '../../../../lib/database';
import { createSafeErrorResponse } from '../../../../lib/errors';

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
  } catch (error: any) {
    const safeError = createSafeErrorResponse(error, 'Failed to load document', `GET /api/documents/${await params.then(p => p.id)}`);
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
}

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
  } catch (error: any) {
    const safeError = createSafeErrorResponse(error, 'Failed to update document', `PUT /api/documents/${await params.then(p => p.id)}`);
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
} 