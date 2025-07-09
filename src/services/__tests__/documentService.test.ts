import axios from 'axios';
import { DocumentService } from '../documentService';
import { CanvasImage, SerializedCanvasImage } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCanvasImages: CanvasImage[] = [
    {
      id: 'img1',
      src: 'https://example.com/image1.jpg',
      x: 100,
      y: 200,
      width: 256,
      height: 256,
      prompt: 'test prompt 1',
      selected: false,
      displayState: 'ready',
      zIndex: 1,
    },
    {
      id: 'img2',
      src: 'https://example.com/image2.jpg',
      x: 300,
      y: 400,
      width: 256,
      height: 256,
      prompt: 'test prompt 2',
      selected: true,
      displayState: 'updating',
      zIndex: 2,
    },
  ];

  const mockSerializedImages: SerializedCanvasImage[] = [
    {
      id: 'img1',
      src: 'https://example.com/image1.jpg',
      x: 100,
      y: 200,
      width: 256,
      height: 256,
      prompt: 'test prompt 1',
      zIndex: 1,
    },
    {
      id: 'img2',
      src: 'https://example.com/image2.jpg',
      x: 300,
      y: 400,
      width: 256,
      height: 256,
      prompt: 'test prompt 2',
      zIndex: 2,
    },
  ];

  describe('saveDocument', () => {
    it('should save document successfully', async () => {
      const mockResponse = {
        data: {
          documentId: 'doc123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await DocumentService.saveDocument('My Canvas', mockCanvasImages);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/documents',
        {
          title: 'My Canvas',
          images: mockSerializedImages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({
        success: true,
        documentId: 'doc123',
      });
    });

    it('should save document without title', async () => {
      const mockResponse = {
        data: {
          documentId: 'doc123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await DocumentService.saveDocument(undefined, mockCanvasImages);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/documents',
        {
          title: undefined,
          images: mockSerializedImages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({
        success: true,
        documentId: 'doc123',
      });
    });

    it('should handle empty images array', async () => {
      const mockResponse = {
        data: {
          documentId: 'doc123',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await DocumentService.saveDocument('Empty Canvas', []);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/documents',
        {
          title: 'Empty Canvas',
          images: [],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({
        success: true,
        documentId: 'doc123',
      });
    });

    it('should handle API error response', async () => {
      const apiError = {
        response: {
          data: {
            error: 'Database connection failed',
          },
        },
        isAxiosError: true,
      };
      mockedAxios.post.mockRejectedValue(apiError);

      const result = await DocumentService.saveDocument('My Canvas', mockCanvasImages);

      expect(result).toEqual({
        success: false,
        error: 'Failed to save document',
      });
    });

    it('should handle generic error', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const result = await DocumentService.saveDocument('My Canvas', mockCanvasImages);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle unknown error', async () => {
      mockedAxios.post.mockRejectedValue('Unknown error');

      const result = await DocumentService.saveDocument('My Canvas', mockCanvasImages);

      expect(result).toEqual({
        success: false,
        error: 'Failed to save document',
      });
    });
  });

  describe('loadDocument', () => {
    it('should load document successfully', async () => {
      const mockDocument = {
        id: 'doc123',
        title: 'My Canvas',
        images: mockSerializedImages,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };
      const mockResponse = {
        data: {
          document: mockDocument,
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await DocumentService.loadDocument('doc123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/documents/doc123',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({
        success: true,
        document: mockDocument,
      });
    });

    it('should handle document not found', async () => {
      const apiError = {
        response: {
          data: {
            error: 'Document not found',
          },
        },
        isAxiosError: true,
      };
      mockedAxios.get.mockRejectedValue(apiError);

      const result = await DocumentService.loadDocument('nonexistent');

      expect(result).toEqual({
        success: false,
        error: 'Failed to load document',
      });
    });

    it('should handle generic error', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      const result = await DocumentService.loadDocument('doc123');

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle unknown error', async () => {
      mockedAxios.get.mockRejectedValue('Unknown error');

      const result = await DocumentService.loadDocument('doc123');

      expect(result).toEqual({
        success: false,
        error: 'Failed to load document',
      });
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      mockedAxios.put.mockResolvedValue({});

      const result = await DocumentService.updateDocument('doc123', 'Updated Canvas', mockCanvasImages);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/documents/doc123',
        {
          title: 'Updated Canvas',
          images: mockSerializedImages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({
        success: true,
        documentId: 'doc123',
      });
    });

    it('should handle API error response', async () => {
      const apiError = {
        response: {
          data: {
            error: 'Document not found',
          },
        },
        isAxiosError: true,
      };
      mockedAxios.put.mockRejectedValue(apiError);

      const result = await DocumentService.updateDocument('doc123', 'Updated Canvas', mockCanvasImages);

      expect(result).toEqual({
        success: false,
        error: 'Failed to update document',
      });
    });
  });

  describe('deserializeImages', () => {
    it('should deserialize images correctly', () => {
      const result = DocumentService.deserializeImages(mockSerializedImages);

      expect(result).toEqual([
        {
          id: 'img1',
          src: '',
          x: 100,
          y: 200,
          width: 256,
          height: 256,
          prompt: 'test prompt 1',
          zIndex: 1,
          selected: false,
          displayState: 'loading',
        },
        {
          id: 'img2',
          src: '',
          x: 300,
          y: 400,
          width: 256,
          height: 256,
          prompt: 'test prompt 2',
          zIndex: 2,
          selected: false,
          displayState: 'loading',
        },
      ]);
    });

    it('should handle empty array', () => {
      const result = DocumentService.deserializeImages([]);

      expect(result).toEqual([]);
    });
  });

  describe('generateShareUrl', () => {
    it('should generate share URL with default base URL', () => {
      const result = DocumentService.generateShareUrl('doc123');

      expect(result).toContain('?doc=doc123');
      expect(result).toContain('doc123');
    });

    it('should generate share URL with custom base URL', () => {
      const result = DocumentService.generateShareUrl('doc123', 'https://custom.com');

      expect(result).toBe('https://custom.com/?doc=doc123');
    });
  });
}); 