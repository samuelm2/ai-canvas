/**
 * SERVER-SIDE ONLY
 * This file should only be imported in Next.js API routes (/app/api/)
 * Never import this file in client-side code (components, hooks, etc.)
 */
import { Pool } from 'pg';
import { AppError, ErrorType, wrapDatabaseOperation } from './errors';

// Database connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new AppError(
        ErrorType.DATABASE_CONNECTION,
        'Document saving is not available.',
        503,
        new Error('DATABASE_URL environment variable is not set')
      );
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  
  return pool;
}

// Initialize database schema (only run once per process)
let isInitialized = false;

export async function initializeDatabase() {
  // Skip if already initialized in this process
  if (isInitialized) {
    return;
  }

  // Check if DATABASE_URL is available, if not, skip initialization
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not configured - document saving disabled');
    return;
  }

  return wrapDatabaseOperation(async () => {
    const pool = getPool();
    
    // Create the documents table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS canvas_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255),
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Schema evolution: Add new columns here as needed
    // Example: await pool.query(`ALTER TABLE canvas_documents ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;`);
    
    isInitialized = true;
    console.log('Database schema initialized successfully');
  }, 'initialize database');
}

// Database operations for canvas documents
export async function saveDocument(title: string | undefined, images: any[]): Promise<string> {
  return wrapDatabaseOperation(async () => {
    const pool = getPool();
    
    const result = await pool.query(
      `INSERT INTO canvas_documents (title, data) 
       VALUES ($1, $2) 
       RETURNING id`,
      [title || 'Untitled Canvas', JSON.stringify({ images })]
    );
    
    return result.rows[0].id;
  }, 'save document');
}

export async function loadDocument(id: string): Promise<any | null> {
  return wrapDatabaseOperation(async () => {
    const pool = getPool();
    
    const result = await pool.query(
      `SELECT id, title, data, created_at, updated_at 
       FROM canvas_documents 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        'Document not found',
        404
      );
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      images: row.data.images,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }, 'load document');
}

export async function updateDocument(id: string, title: string | undefined, images: any[]): Promise<boolean> {
  return wrapDatabaseOperation(async () => {
    const pool = getPool();
    
    const result = await pool.query(
      `UPDATE canvas_documents 
       SET title = $1, data = $2, updated_at = NOW() 
       WHERE id = $3`,
      [title || 'Untitled Canvas', JSON.stringify({ images }), id]
    );
    
    const rowCount = result.rowCount || 0;
    
    if (rowCount === 0) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        'Document not found',
        404
      );
    }
    
    return true;
  }, 'update document');
} 