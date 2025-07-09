import axios from 'axios';
import { AIService } from '../aiService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      const mockResponse = {
        data: {
          imageUrl: 'https://example.com/image.jpg',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await AIService.generateImage('test prompt');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/generate-image',
        { prompt: 'test prompt' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: undefined,
        }
      );
      expect(result).toEqual({
        success: true,
        imageUrl: 'https://example.com/image.jpg',
      });
    });

    it('should handle empty prompt', async () => {
      const result = await AIService.generateImage('');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Prompt is required and cannot be empty',
      });
    });

    it('should handle whitespace-only prompt', async () => {
      const result = await AIService.generateImage('   ');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Prompt is required and cannot be empty',
      });
    });

    it('should trim prompt before sending', async () => {
      const mockResponse = {
        data: {
          imageUrl: 'https://example.com/image.jpg',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await AIService.generateImage('  test prompt  ');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/generate-image',
        { prompt: 'test prompt' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: undefined,
        }
      );
    });

    it('should handle request cancellation', async () => {
      const abortController = new AbortController();
      const abortError = new Error('Request cancelled');
      abortError.name = 'AbortError';
      mockedAxios.post.mockRejectedValue(abortError);

      const result = await AIService.generateImage('test prompt', abortController.signal);

      expect(result).toEqual({
        success: false,
        error: 'Request cancelled',
      });
    });

    it('should handle axios cancellation', async () => {
      const abortController = new AbortController();
      const cancelError = {
        code: 'ERR_CANCELED',
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValue(cancelError);

      const result = await AIService.generateImage('test prompt', abortController.signal);

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate image',
      });
    });

    it('should handle API error response', async () => {
      const apiError = {
        response: {
          data: {
            error: 'API rate limit exceeded',
          },
        },
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValue(apiError);

      const result = await AIService.generateImage('test prompt');

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate image',
      });
    });

    it('should handle generic error', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const result = await AIService.generateImage('test prompt');

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle unknown error', async () => {
      mockedAxios.post.mockRejectedValue('Unknown error');

      const result = await AIService.generateImage('test prompt');

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate image',
      });
    });
  });

  describe('generatePromptVariations', () => {
    it('should generate prompt variations successfully', async () => {
      const mockResponse = {
        data: {
          variations: [
            'variation 1',
            'variation 2',
            'variation 3',
            'variation 4',
          ],
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await AIService.generatePromptVariations('original prompt');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/generate-variations',
        { prompt: 'original prompt' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: undefined,
        }
      );
      expect(result).toEqual({
        success: true,
        variations: [
          'variation 1',
          'variation 2',
          'variation 3',
          'variation 4',
        ],
      });
    });

    it('should handle empty prompt', async () => {
      const result = await AIService.generatePromptVariations('');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Failed to generate variations',
      });
    });

    it('should handle whitespace-only prompt', async () => {
      const result = await AIService.generatePromptVariations('   ');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Failed to generate variations',
      });
    });

    it('should trim prompt before sending', async () => {
      const mockResponse = {
        data: {
          variations: ['variation 1', 'variation 2'],
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await AIService.generatePromptVariations('  original prompt  ');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/generate-variations',
        { prompt: 'original prompt' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: undefined,
        }
      );
    });

    it('should handle request cancellation', async () => {
      const abortController = new AbortController();
      const abortError = new Error('Request cancelled');
      abortError.name = 'AbortError';
      mockedAxios.post.mockRejectedValue(abortError);

      const result = await AIService.generatePromptVariations('test prompt', abortController.signal);

      expect(result).toEqual({
        success: false,
        error: 'Request cancelled',
      });
    });

    it('should handle axios cancellation', async () => {
      const abortController = new AbortController();
      const cancelError = {
        code: 'ERR_CANCELED',
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValue(cancelError);

      const result = await AIService.generatePromptVariations('test prompt', abortController.signal);

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate variations',
      });
    });

    it('should handle API error response', async () => {
      const apiError = {
        response: {
          data: {
            error: 'API rate limit exceeded',
          },
        },
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValue(apiError);

      const result = await AIService.generatePromptVariations('test prompt');

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate variations',
      });
    });

    it('should handle generic error without specific message', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const result = await AIService.generatePromptVariations('test prompt');

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate variations',
      });
    });
  });
}); 