import { NextRequest, NextResponse } from 'next/server';
import { saveDocument, initializeDatabase } from '../../../lib/database';
import { SaveDocumentRequest } from '../../../types';
import { createSafeErrorResponse } from '../../../lib/errors';

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
    
    // Create shareable URL
    const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/?doc=${documentId}`;

    return NextResponse.json({
      success: true,
      documentId,
      shareUrl,
    });
  } catch (error: any) {
    const safeError = createSafeErrorResponse(error, 'Failed to save document', 'POST /api/documents');
    return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
  }
} 