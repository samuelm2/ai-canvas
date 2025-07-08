// Error types for categorizing different kinds of errors
export enum ErrorType {
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  DATABASE_QUERY = 'DATABASE_QUERY',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL',
}

// Standardized API response types
export interface ApiErrorResponse {
  error: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
}

// Custom error class with categorization
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly originalError?: Error;

  constructor(
    type: ErrorType,
    userMessage: string,
    statusCode: number = 500,
    originalError?: Error
  ) {
    super(userMessage);
    this.type = type;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.originalError = originalError;
    
    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Enhanced error logging for production debugging
function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  
  if (error instanceof AppError) {
    console.error(`${timestamp} ${contextStr} AppError [${error.type}]:`, {
      message: error.userMessage,
      statusCode: error.statusCode,
      originalError: error.originalError?.message,
      stack: error.originalError?.stack,
    });
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error:`, {
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`${timestamp} ${contextStr} Unknown error:`, error);
  }
}

// Utility function to create safe error responses for API routes
export function createSafeErrorResponse(error: unknown, fallbackMessage: string = 'An unexpected error occurred', context?: string): ApiErrorResponse {
  // Log the full error for debugging (server-side only)
  logError(error, context);

  // If it's our custom AppError, use the user-friendly message
  if (error instanceof AppError) {
    return {
      error: error.userMessage,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: context,
    };
  }

  // For unknown errors, return a generic message
  return {
    error: fallbackMessage,
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: context,
  };
}

// Utility to wrap database operations with proper error handling
export function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return operation().catch((error) => {
    // Log the original error for debugging
    logError(error, `Database operation: ${operationName}`);
    
    // If it's already an AppError, re-throw it as-is
    if (error instanceof AppError) {
      throw error;
    }
    
    // Check for common database connection errors
    if (error.message?.includes('DATABASE_URL') || error.code === 'ECONNREFUSED') {
      throw new AppError(
        ErrorType.DATABASE_CONNECTION,
        'Service is currently unavailable. Please try again later.',
        503,
        error
      );
    }
    
    // Check for database query errors
    if (error.code?.startsWith('23') || error.code?.startsWith('22')) {
      throw new AppError(
        ErrorType.DATABASE_QUERY,
        'Invalid data provided. Please check your input and try again.',
        400,
        error
      );
    }
    
    // Generic database error
    throw new AppError(
      ErrorType.DATABASE_QUERY,
      `Failed to ${operationName}. Please try again.`,
      500,
      error
    );
  });
}

// Utility functions for common validation errors
export function createValidationError(message: string): AppError {
  return new AppError(ErrorType.VALIDATION, message, 400);
}

export function createNotFoundError(resource: string): AppError {
  return new AppError(ErrorType.NOT_FOUND, `${resource} not found`, 404);
} 