/**
 * ERROR UTILITIES
 * 
 * @fileoverview Utility functions for handling and extracting error messages
 * from various error types including Axios errors, standard errors, and
 * unknown error objects.
 */
import { isAxiosError } from 'axios';

/**
 * Safely extract an error message from various error types
 * 
 * @param {unknown} error - The error object to extract a message from
 * @param {string} fallbackMessage - Default message if no specific error message can be extracted
 * @returns {string} A user-friendly error message
 * 
 * @description Safely extracts error messages from different error types with graceful
 * fallbacks. Handles Axios errors with API response data, standard Error objects,
 * and unknown error types. Provides consistent error message formatting across
 * the application.
 * 
 * @example
 * // With Axios error
 * try {
 *   await axios.post('/api/endpoint', data);
 * } catch (error) {
 *   const message = extractErrorMessage(error, 'Request failed');
 *   console.log(message); // "Invalid input data" (from API response)
 * }
 * 
 * // With standard Error
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error) {
 *   const message = extractErrorMessage(error, 'Operation failed');
 *   console.log(message); // "Something went wrong"
 * }
 * 
 * // With unknown error
 * try {
 *   JSON.parse('invalid json');
 * } catch (error) {
 *   const message = extractErrorMessage(error, 'Parse failed');
 *   console.log(message); // Specific JSON error or "Parse failed"
 * }
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