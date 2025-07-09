import {
  AppError,
  ErrorType,
  createSafeErrorResponse,
  wrapDatabaseOperation,
  createValidationError,
  createNotFoundError,
} from '../errors';

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Error Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const originalError = new Error('Original error message');
      const appError = new AppError(
        ErrorType.DATABASE_CONNECTION,
        'User friendly message',
        503,
        originalError
      );

      expect(appError).toBeInstanceOf(Error);
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.type).toBe(ErrorType.DATABASE_CONNECTION);
      expect(appError.userMessage).toBe('User friendly message');
      expect(appError.statusCode).toBe(503);
      expect(appError.originalError).toBe(originalError);
      expect(appError.message).toBe('User friendly message');
    });

    it('should create an AppError with default status code', () => {
      const appError = new AppError(
        ErrorType.INTERNAL,
        'Internal error'
      );

      expect(appError.type).toBe(ErrorType.INTERNAL);
      expect(appError.userMessage).toBe('Internal error');
      expect(appError.statusCode).toBe(500);
      expect(appError.originalError).toBeUndefined();
    });

    it('should create an AppError without original error', () => {
      const appError = new AppError(
        ErrorType.VALIDATION,
        'Validation failed',
        400
      );

      expect(appError.type).toBe(ErrorType.VALIDATION);
      expect(appError.userMessage).toBe('Validation failed');
      expect(appError.statusCode).toBe(400);
      expect(appError.originalError).toBeUndefined();
    });

    it('should maintain proper stack trace', () => {
      const appError = new AppError(
        ErrorType.NOT_FOUND,
        'Resource not found',
        404
      );

      expect(appError.stack).toBeDefined();
      expect(appError.stack).toContain('Error');
    });

    it('should handle all error types', () => {
      const errorTypes = [
        ErrorType.DATABASE_CONNECTION,
        ErrorType.DATABASE_QUERY,
        ErrorType.VALIDATION,
        ErrorType.NOT_FOUND,
        ErrorType.EXTERNAL_API,
        ErrorType.INTERNAL,
      ];

      errorTypes.forEach((type) => {
        const appError = new AppError(type, 'Test message');
        expect(appError.type).toBe(type);
      });
    });
  });

  describe('createSafeErrorResponse', () => {
    it('should create response from AppError', () => {
      const appError = new AppError(
        ErrorType.NOT_FOUND,
        'Resource not found',
        404
      );

      const response = createSafeErrorResponse(appError, 'Fallback message', '/api/test');

      expect(response).toEqual({
        error: 'Resource not found',
        statusCode: 404,
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should create response with fallback message for unknown errors', () => {
      const unknownError = 'Unknown error string';

      const response = createSafeErrorResponse(unknownError, 'Fallback message', '/api/test');

      expect(response).toEqual({
        error: 'Fallback message',
        statusCode: 500,
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should create response with default fallback message', () => {
      const error = new Error('Regular error');

      const response = createSafeErrorResponse(error);

      expect(response).toEqual({
        error: 'An unexpected error occurred',
        statusCode: 500,
        timestamp: expect.any(String),
        path: undefined,
      });
    });

    it('should create response without context', () => {
      const appError = new AppError(
        ErrorType.VALIDATION,
        'Validation failed',
        400
      );

      const response = createSafeErrorResponse(appError);

      expect(response).toEqual({
        error: 'Validation failed',
        statusCode: 400,
        timestamp: expect.any(String),
        path: undefined,
      });
    });

    it('should log errors to console', () => {
      const appError = new AppError(
        ErrorType.DATABASE_CONNECTION,
        'Database error',
        503
      );

      createSafeErrorResponse(appError, 'Fallback', '/api/test');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('AppError [DATABASE_CONNECTION]'),
        expect.objectContaining({
          message: 'Database error',
          statusCode: 503,
        })
      );
    });

    it('should handle regular Error objects', () => {
      const error = new Error('Regular error message');

      const response = createSafeErrorResponse(error, 'Fallback');

      expect(response).toEqual({
        error: 'Fallback',
        statusCode: 500,
        timestamp: expect.any(String),
        path: undefined,
      });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error:'),
        expect.objectContaining({
          message: 'Regular error message',
          stack: expect.any(String),
        })
      );
    });

    it('should include valid timestamp', () => {
      const error = new Error('Test error');
      const response = createSafeErrorResponse(error);

      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp!).toISOString()).toBe(response.timestamp);
    });
  });

  describe('wrapDatabaseOperation', () => {
    it('should return result on successful operation', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await wrapDatabaseOperation(mockOperation, 'test operation');

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should re-throw AppError as-is', async () => {
      const originalError = new AppError(
        ErrorType.VALIDATION,
        'Validation failed',
        400
      );
      const mockOperation = jest.fn().mockRejectedValue(originalError);

      await expect(
        wrapDatabaseOperation(mockOperation, 'test operation')
      ).rejects.toThrow(originalError);
    });

    it('should handle database connection errors', async () => {
      const connectionError = new Error('DATABASE_URL is not set');
      const mockOperation = jest.fn().mockRejectedValue(connectionError);

      await expect(
        wrapDatabaseOperation(mockOperation, 'test operation')
      ).rejects.toThrow(AppError);
    });

    it('should handle various database errors', async () => {
      const connectionError = { message: 'Connection refused', code: 'ECONNREFUSED' };
      const constraintError = { message: 'Constraint violation', code: '23505' };
      const genericError = new Error('Generic database error');
      
      const mockOperation1 = jest.fn().mockRejectedValue(connectionError);
      const mockOperation2 = jest.fn().mockRejectedValue(constraintError);
      const mockOperation3 = jest.fn().mockRejectedValue(genericError);

      await expect(wrapDatabaseOperation(mockOperation1, 'test')).rejects.toThrow(AppError);
      await expect(wrapDatabaseOperation(mockOperation2, 'test')).rejects.toThrow(AppError);
      await expect(wrapDatabaseOperation(mockOperation3, 'test')).rejects.toThrow(AppError);
    });

    it('should log original error for debugging', async () => {
      const originalError = new Error('Original error');
      const mockOperation = jest.fn().mockRejectedValue(originalError);

      await wrapDatabaseOperation(mockOperation, 'test operation').catch(() => {});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation: test operation'),
        expect.objectContaining({
          message: 'Original error',
          stack: expect.any(String),
        })
      );
    });
  });

  describe('createValidationError', () => {
    it('should create validation error with correct properties', () => {
      const error = createValidationError('Invalid input provided');

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.userMessage).toBe('Invalid input provided');
      expect(error.statusCode).toBe(400);
    });

    it('should handle empty message', () => {
      const error = createValidationError('');

      expect(error.userMessage).toBe('');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.statusCode).toBe(400);
    });

    it('should handle special characters in message', () => {
      const message = 'Invalid chars: @#$%^&*()';
      const error = createValidationError(message);

      expect(error.userMessage).toBe(message);
    });
  });

  describe('createNotFoundError', () => {
    it('should create not found error with correct properties', () => {
      const error = createNotFoundError('Document');

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.userMessage).toBe('Document not found');
      expect(error.statusCode).toBe(404);
    });

    it('should handle different resource types', () => {
      const resources = ['User', 'Image', 'Canvas', 'API endpoint'];

      resources.forEach((resource) => {
        const error = createNotFoundError(resource);
        expect(error.userMessage).toBe(`${resource} not found`);
        expect(error.type).toBe(ErrorType.NOT_FOUND);
        expect(error.statusCode).toBe(404);
      });
    });

    it('should handle empty resource name', () => {
      const error = createNotFoundError('');

      expect(error.userMessage).toBe(' not found');
      expect(error.type).toBe(ErrorType.NOT_FOUND);
    });
  });

  describe('ErrorType enum', () => {
    it('should contain all expected error types', () => {
      expect(ErrorType.DATABASE_CONNECTION).toBe('DATABASE_CONNECTION');
      expect(ErrorType.DATABASE_QUERY).toBe('DATABASE_QUERY');
      expect(ErrorType.VALIDATION).toBe('VALIDATION');
      expect(ErrorType.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorType.EXTERNAL_API).toBe('EXTERNAL_API');
      expect(ErrorType.INTERNAL).toBe('INTERNAL');
    });
  });
}); 