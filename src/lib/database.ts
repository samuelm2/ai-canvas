/**
 * DATABASE LIBRARY - SERVER-SIDE ONLY
 * 
 * @fileoverview This module provides database operations for the AI Canvas application.
 * It handles PostgreSQL connections, schema initialization, and CRUD operations
 * for canvas documents. This file should only be imported in Next.js API routes.
 * 
 * @warning SERVER-SIDE ONLY - Never import this file in client-side code
 * (components, hooks, etc.)
 */
import { Pool } from 'pg';
import { AppError, ErrorType, wrapDatabaseOperation } from './errors';
import { CanvasImage, CanvasDocument } from '../types';

/**
 * Database connection pool instance
 * @type {Pool | null}
 */
let pool: Pool | null = null;

/**
 * Get or create the PostgreSQL connection pool
 * 
 * @returns {Pool} The PostgreSQL connection pool
 * @throws {AppError} When DATABASE_URL environment variable is not set
 * 
 * @description Creates a singleton PostgreSQL connection pool for the application.
 * Uses SSL in production and handles connection string validation.
 * 
 * @example
 * const pool = getPool();
 * const result = await pool.query('SELECT NOW()');
 */
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

/**
 * Database initialization state
 * @type {boolean}
 */
let isInitialized = false;

/**
 * Initialize the database schema
 * 
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 * 
 * @description Creates the canvas_documents table if it doesn't exist.
 * Only runs once per process. Skips initialization if DATABASE_URL is not configured.
 * 
 * @example
 * // In an API route
 * await initializeDatabase();
 * console.log('Database ready for operations');
 */
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

/**
 * Save a new canvas document to the database
 * 
 * @param {string | undefined} title - Optional title for the document
 * @param {CanvasImage[]} images - Array of canvas images to save
 * @returns {Promise<string>} Promise that resolves to the generated document UUID
 * @throws {AppError} When database operation fails
 * 
 * @description Saves a new canvas document with the provided title and images.
 * The images are stored as JSONB data. Returns the auto-generated UUID.
 * 
 * @example
 * const documentId = await saveDocument(
 *   "My Beautiful Canvas",
 *   canvasImages
 * );
 * console.log("Document saved with ID:", documentId);
 */
export async function saveDocument(title: string | undefined, images: CanvasImage[]): Promise<string> {
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

/**
 * Load a canvas document from the database by ID
 * 
 * @param {string} id - UUID of the document to load
 * @returns {Promise<CanvasDocument | null>} Promise that resolves to the document or null
 * @throws {AppError} When document is not found or database operation fails
 * 
 * @description Loads a canvas document from the database using its UUID.
 * Returns the complete document with metadata and images.
 * 
 * @example
 * const document = await loadDocument("123e4567-e89b-12d3-a456-426614174000");
 * if (document) {
 *   console.log("Loaded document:", document.title);
 *   console.log("Images:", document.images.length);
 * }
 */
export async function loadDocument(id: string): Promise<CanvasDocument | null> {
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

/**
 * Update an existing canvas document in the database
 * 
 * @param {string} id - UUID of the document to update
 * @param {string | undefined} title - Optional updated title for the document
 * @param {CanvasImage[]} images - Updated array of canvas images
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 * @throws {AppError} When document is not found or database operation fails
 * 
 * @description Updates an existing canvas document with new title and images.
 * Sets the updated_at timestamp to the current time.
 * 
 * @example
 * const success = await updateDocument(
 *   documentId,
 *   "Updated Canvas Title",
 *   updatedImages
 * );
 * if (success) {
 *   console.log("Document updated successfully");
 * }
 */
export async function updateDocument(id: string, title: string | undefined, images: CanvasImage[]): Promise<boolean> {
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