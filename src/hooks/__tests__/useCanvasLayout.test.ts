import { renderHook, act } from '@testing-library/react';
import { useCanvasLayout } from '../useCanvasLayout';
import { CanvasImage } from '../../types';

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200,
});

// Mock setTimeout
jest.useFakeTimers();

describe('useCanvasLayout', () => {
  const mockImage1: CanvasImage = {
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
  };

  const mockImage2: CanvasImage = {
    id: 'img2',
    src: 'https://example.com/image2.jpg',
    x: 300,
    y: 400,
    width: 256,
    height: 256,
    prompt: 'test prompt 2',
    selected: false,
    displayState: 'ready',
    zIndex: 2,
  };

  const mockImage3: CanvasImage = {
    id: 'img3',
    src: 'https://example.com/image3.jpg',
    x: 500,
    y: 600,
    width: 256,
    height: 256,
    prompt: 'test prompt 3',
    selected: false,
    displayState: 'ready',
    zIndex: 3,
  };

  const mockProps = {
    images: [mockImage1, mockImage2, mockImage3],
    setImages: jest.fn(),
    setIsOrganizing: jest.fn(),
    clearAll: jest.fn(),
    cleanup: jest.fn(),
    resetDocumentState: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('organizeInGrid', () => {
    it('should organize images in a grid layout', () => {
      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setIsOrganizing).toHaveBeenCalledWith(true);
      expect(mockProps.setImages).toHaveBeenCalledWith([
        {
          ...mockImage1,
          x: 50, // GRID_START_X
          y: 50, // GRID_START_Y
        },
        {
          ...mockImage2,
          x: 326, // GRID_START_X + 1 * (256 + 20)
          y: 50,
        },
        {
          ...mockImage3,
          x: 602, // GRID_START_X + 2 * (256 + 20)
          y: 50,
        },
      ]);
    });

    it('should wrap to next row when exceeding available width', () => {
      // Set narrower window width to force wrapping (mobile size: 128px)
      Object.defineProperty(window, 'innerWidth', {
        value: 700,
      });

      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setImages).toHaveBeenCalledWith([
        {
          ...mockImage1,
          x: 50, // First row, first column
          y: 50,
        },
        {
          ...mockImage2,
          x: 198, // First row, second column (50 + 128 + 20)
          y: 50,
        },
        {
          ...mockImage3,
          x: 346, // First row, third column (50 + 2 * (128 + 20))
          y: 50,
        },
      ]);
    });

    it('should handle single column layout on very narrow screens', () => {
      // Set very narrow window width to force single column (mobile size: 128px)
      Object.defineProperty(window, 'innerWidth', {
        value: 240,
      });

      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setImages).toHaveBeenCalledWith([
        {
          ...mockImage1,
          x: 50, // First row
          y: 50,
        },
        {
          ...mockImage2,
          x: 50, // Second row
          y: 198, // GRID_START_Y + 1 * (128 + 20)
        },
        {
          ...mockImage3,
          x: 50, // Third row
          y: 346, // GRID_START_Y + 2 * (128 + 20)
        },
      ]);
    });

    it('should handle empty images array', () => {
      const emptyProps = {
        ...mockProps,
        images: [],
      };

      const { result } = renderHook(() => useCanvasLayout(emptyProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setIsOrganizing).toHaveBeenCalledWith(true);
      expect(mockProps.setImages).toHaveBeenCalledWith([]);
    });

    it('should set organizing state to false after timeout', () => {
      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setIsOrganizing).toHaveBeenCalledWith(true);

      // Fast forward time by 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockProps.setIsOrganizing).toHaveBeenCalledWith(false);
    });

    it('should handle single image', () => {
      const singleImageProps = {
        ...mockProps,
        images: [mockImage1],
      };

      const { result } = renderHook(() => useCanvasLayout(singleImageProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setImages).toHaveBeenCalledWith([
        {
          ...mockImage1,
          x: 50,
          y: 50,
        },
      ]);
    });

    it('should preserve image properties other than position', () => {
      const imageWithExtraProps = {
        ...mockImage1,
        selected: true,
        displayState: 'updating' as const,
        zIndex: 10,
      };

      const propsWithExtraProps = {
        ...mockProps,
        images: [imageWithExtraProps],
      };

      const { result } = renderHook(() => useCanvasLayout(propsWithExtraProps));

      act(() => {
        result.current.organizeInGrid();
      });

      expect(mockProps.setImages).toHaveBeenCalledWith([
        {
          ...imageWithExtraProps,
          x: 50,
          y: 50,
        },
      ]);
    });
  });

  describe('clearCanvas', () => {
    it('should call cleanup, clearAll, and resetDocumentState', () => {
      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.clearCanvas();
      });

      expect(mockProps.cleanup).toHaveBeenCalledTimes(1);
      expect(mockProps.clearAll).toHaveBeenCalledTimes(1);
      expect(mockProps.resetDocumentState).toHaveBeenCalledTimes(1);
    });

    it('should call functions in correct order', () => {
      const callOrder: string[] = [];

      const orderedProps = {
        ...mockProps,
        cleanup: jest.fn(() => callOrder.push('cleanup')),
        clearAll: jest.fn(() => callOrder.push('clearAll')),
        resetDocumentState: jest.fn(() => callOrder.push('resetDocumentState')),
      };

      const { result } = renderHook(() => useCanvasLayout(orderedProps));

      act(() => {
        result.current.clearCanvas();
      });

      expect(callOrder).toEqual(['cleanup', 'clearAll', 'resetDocumentState']);
    });
  });

  describe('grid calculation logic', () => {
    it('should calculate correct number of columns for different window widths', () => {
      // Test with window width 1200
      Object.defineProperty(window, 'innerWidth', { value: 1200 });
      
      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.organizeInGrid();
      });

      // Available width = 1200 - 50 (start) - 50 (padding) = 1100
      // Item width with gap = 256 + 20 = 276
      // Columns = floor(1100 / 276) = 3
      const firstCallArgs = mockProps.setImages.mock.calls[0][0];
      expect(firstCallArgs[0].x).toBe(50);   // Column 0
      expect(firstCallArgs[1].x).toBe(326);  // Column 1
      expect(firstCallArgs[2].x).toBe(602);  // Column 2
    });

    it('should ensure at least one column even on very narrow screens', () => {
      // Test with extremely narrow width (mobile size: 128px)
      Object.defineProperty(window, 'innerWidth', { value: 200 });
      
      const { result } = renderHook(() => useCanvasLayout(mockProps));

      act(() => {
        result.current.organizeInGrid();
      });

      // Should still create at least one column
      const firstCallArgs = mockProps.setImages.mock.calls[0][0];
      expect(firstCallArgs[0].x).toBe(50);   // Column 0
      expect(firstCallArgs[1].x).toBe(50);   // Column 0 (wrapped)
      expect(firstCallArgs[2].x).toBe(50);   // Column 0 (wrapped)
      
      // Check y positions for wrapping (mobile size: 128px)
      expect(firstCallArgs[0].y).toBe(50);   // Row 0
      expect(firstCallArgs[1].y).toBe(198);  // Row 1 (50 + 128 + 20)
      expect(firstCallArgs[2].y).toBe(346);  // Row 2 (50 + 2 * (128 + 20))
    });
  });
}); 