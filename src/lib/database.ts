import { Pool } from 'pg';

// Database connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
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

  const pool = getPool();
  
  try {
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
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Database operations for canvas documents
export async function saveDocument(title: string | undefined, images: any[]): Promise<string> {
  const pool = getPool();
  
  try {
    const result = await pool.query(
      `INSERT INTO canvas_documents (title, data) 
       VALUES ($1, $2) 
       RETURNING id`,
      [title || 'Untitled Canvas', JSON.stringify({ images })]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

export async function loadDocument(id: string): Promise<any | null> {
  const pool = getPool();
  
  try {
    const result = await pool.query(
      `SELECT id, title, data, created_at, updated_at 
       FROM canvas_documents 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      images: row.data.images,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('Error loading document:', error);
    throw error;
  }
}

export async function updateDocument(id: string, title: string | undefined, images: any[]): Promise<boolean> {
  const pool = getPool();
  
  try {
    const result = await pool.query(
      `UPDATE canvas_documents 
       SET title = $1, data = $2, updated_at = NOW() 
       WHERE id = $3`,
      [title || 'Untitled Canvas', JSON.stringify({ images }), id]
    );
    
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
} 