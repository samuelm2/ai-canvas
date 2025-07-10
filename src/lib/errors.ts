/**
 * ERROR HANDLING LIBRARY
 * 
 * @fileoverview Provides comprehensive error handling utilities for the AI Canvas application.
 * Includes error categorization, custom error classes, safe error responses for APIs,
 * and utilities for database operation error handling.
 */

/**
 * Error types for categorizing different kinds of errors
 * 
 * @enum {string}
 * @description Categorizes errors by their source and type for better error handling
 * and user messaging. Each type maps to appropriate HTTP status codes and user messages.
 */
export enum ErrorType {
  /** Database connection failures */
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  /** Database query or operation failures */
  DATABASE_QUERY = 'DATABASE_QUERY',
  /** Input validation errors */
  VALIDATION = 'VALIDATION',
  /** Resource not found errors */
  NOT_FOUND = 'NOT_FOUND',
  /** External API service errors */
  EXTERNAL_API = 'EXTERNAL_API',
  /** Internal application errors */
  INTERNAL = 'INTERNAL',
}

/**
 * Standardized API error response structure
 * 
 * @interface ApiErrorResponse
 * @property {string} error - User-friendly error message
 * @property {number} statusCode - HTTP status code
 * @property {string} [timestamp] - Optional ISO timestamp of the error
 * @property {string} [path] - Optional context path where error occurred
 */
export interface ApiErrorResponse {
  error: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

/**
 * Custom application error class with categorization and context
 * 
 * @class AppError
 * @extends {Error}
 * 
 * @description A custom error class that provides structured error information
 * including error type, HTTP status codes, user-friendly messages, and original
 * error context for debugging.
 * 
 * @example
 * throw new AppError(
 *   ErrorType.VALIDATION,
 *   "Invalid email format",
 *   400,
 *   originalError
 * );
 */
export class AppError extends Error {
  /** The categorized type of error */
  public readonly type: ErrorType;
  /** HTTP status code for the error */
  public readonly statusCode: number;
  /** User-friendly error message */
  public readonly userMessage: string;
  /** Original error that caused this AppError */
  public readonly originalError?: Error;

  /**
   * Create a new AppError instance
   * 
   * @param {ErrorType} type - The category of error
   * @param {string} userMessage - User-friendly error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Error} [originalError] - Original error that caused this
   */
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

/**
 * Enhanced error logging for production debugging
 * 
 * @param {unknown} error - The error to log
 * @param {string} [context] - Optional context describing where the error occurred
 * 
 * @description Logs errors with structured information including timestamps,
 * context, error types, and stack traces. Handles both AppError instances
 * and generic Error objects.
 * 
 * @example
 * logError(error, "User authentication");
 * logError(new AppError(ErrorType.VALIDATION, "Invalid input"), "POST /api/users");
 */
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

/**
 * Create safe error responses for API routes
 * 
 * @param {unknown} error - The error to convert to a safe response
 * @param {string} [fallbackMessage="An unexpected error occurred"] - Default message for unknown errors
 * @param {string} [context] - Optional context for logging and response
 * @returns {ApiErrorResponse} Standardized error response safe for client consumption
 * 
 * @description Converts any error into a standardized API response format.
 * Logs the full error details server-side while returning safe, user-friendly
 * messages to the client. Handles AppError instances specially to preserve
 * their structured information.
 * 
 * @example
 * // In an API route
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const safeError = createSafeErrorResponse(
 *     error,
 *     "Failed to process request",
 *     "POST /api/documents"
 *   );
 *   return NextResponse.json({ error: safeError.error }, { status: safeError.statusCode });
 * }
 */
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

/**
 * Wrap database operations with proper error handling
 * 
 * @template T
 * @param {() => Promise<T>} operation - The database operation to execute
 * @param {string} operationName - Descriptive name for the operation
 * @returns {Promise<T>} Promise that resolves to the operation result or throws AppError
 * 
 * @description Wraps database operations to provide consistent error handling.
 * Catches database-specific errors and converts them to appropriate AppError
 * instances with user-friendly messages.
 * 
 * @example
 * const result = await wrapDatabaseOperation(async () => {
 *   return await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
 * }, 'fetch user');
 */
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

/**
 * Create a validation error with standardized format
 * 
 * @param {string} message - The validation error message
 * @returns {AppError} AppError instance with VALIDATION type and 400 status
 * 
 * @description Utility function to create validation errors with consistent
 * formatting and appropriate HTTP status code.
 * 
 * @example
 * if (!email.includes('@')) {
 *   throw createValidationError("Please provide a valid email address");
 * }
 */
export function createValidationError(message: string): AppError {
  return new AppError(ErrorType.VALIDATION, message, 400);
}

/**
 * Create a not found error with standardized format
 * 
 * @param {string} resource - The name of the resource that was not found
 * @returns {AppError} AppError instance with NOT_FOUND type and 404 status
 * 
 * @description Utility function to create not found errors with consistent
 * formatting and appropriate HTTP status code.
 * 
 * @example
 * if (!user) {
 *   throw createNotFoundError("User");
 * }
 */
export function createNotFoundError(resource: string): AppError {
  return new AppError(ErrorType.NOT_FOUND, `${resource} not found`, 404);
} 