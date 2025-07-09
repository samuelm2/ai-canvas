import { isAxiosError } from 'axios';

/**
 * Safely extracts an error message from an axios error or other error types
 * Handles both string and object error responses from APIs
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isAxiosError(error) && error.response?.data?.error) {
    const apiError = error.response.data.error;
    // Handle both string and object error responses
    if (typeof apiError === 'string') {
      return apiError;
    } else if (typeof apiError === 'object' && apiError !== null && 'message' in apiError) {
      return String(apiError.message);
    } else {
      return 'API error occurred';
    }
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return fallbackMessage;
  }
} 