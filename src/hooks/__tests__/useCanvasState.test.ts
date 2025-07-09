import { renderHook, act } from '@testing-library/react';
import { useCanvasState } from '../useCanvasState';
import { CanvasImage } from '../../types';

describe('useCanvasState', () => {
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

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCanvasState());

    expect(result.current.images).toEqual([]);
    expect(result.current.selectedImageId).toBe(null);
    expect(result.current.selectedImage).toBe(undefined);
    expect(result.current.currentPrompt).toBe('');
    expect(result.current.isOrganizing).toBe(false);
    expect(result.current.error).toBe(null);
  });

  describe('addImage', () => {
    it('should add a new image to the array', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
      });

      expect(result.current.images).toEqual([mockImage1]);
    });

    it('should add multiple images', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.addImage(mockImage2);
      });

      expect(result.current.images).toEqual([mockImage1, mockImage2]);
    });
  });

  describe('updateImage', () => {
    it('should update an existing image', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
      });

      act(() => {
        result.current.updateImage('img1', { x: 150, y: 250 });
      });

      expect(result.current.images[0]).toEqual({
        ...mockImage1,
        x: 150,
        y: 250,
      });
    });

    it('should not update non-existent image', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
      });

      act(() => {
        result.current.updateImage('nonexistent', { x: 150, y: 250 });
      });

      expect(result.current.images[0]).toEqual(mockImage1);
    });

    it('should update multiple properties', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
      });

      act(() => {
        result.current.updateImage('img1', {
          x: 150,
          y: 250,
          prompt: 'updated prompt',
          displayState: 'updating',
        });
      });

      expect(result.current.images[0]).toEqual({
        ...mockImage1,
        x: 150,
        y: 250,
        prompt: 'updated prompt',
        displayState: 'updating',
      });
    });
  });

  describe('deleteImage', () => {
    it('should delete an existing image', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.addImage(mockImage2);
      });

      act(() => {
        result.current.deleteImage('img1');
      });

      expect(result.current.images).toEqual([mockImage2]);
    });

    it('should not delete non-existent image', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
      });

      act(() => {
        result.current.deleteImage('nonexistent');
      });

      expect(result.current.images).toEqual([mockImage1]);
    });

    it('should clear selected image if deleted image was selected', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.selectImage('img1');
        result.current.setCurrentPrompt('test prompt');
      });

      expect(result.current.selectedImageId).toBe('img1');
      expect(result.current.currentPrompt).toBe('test prompt');

      act(() => {
        result.current.deleteImage('img1');
      });

      expect(result.current.selectedImageId).toBe(null);
      expect(result.current.currentPrompt).toBe('');
    });

    it('should not clear selected image if deleted image was not selected', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.addImage(mockImage2);
        result.current.selectImage('img1');
        result.current.setCurrentPrompt('test prompt');
      });

      act(() => {
        result.current.deleteImage('img2');
      });

      expect(result.current.selectedImageId).toBe('img1');
      expect(result.current.currentPrompt).toBe('test prompt');
    });
  });

  describe('selectImage', () => {
    it('should select an image', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.addImage(mockImage2);
      });

      act(() => {
        result.current.selectImage('img1');
      });

      expect(result.current.selectedImageId).toBe('img1');
      expect(result.current.selectedImage).toEqual({
        ...mockImage1,
        selected: true,
      });
      expect(result.current.images[0].selected).toBe(true);
      expect(result.current.images[1].selected).toBe(false);
    });

    it('should deselect current image when selecting null', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.selectImage('img1');
      });

      expect(result.current.selectedImageId).toBe('img1');

      act(() => {
        result.current.selectImage(null);
      });

      expect(result.current.selectedImageId).toBe(null);
      expect(result.current.selectedImage).toBe(undefined);
      expect(result.current.images[0].selected).toBe(false);
    });

    it('should switch selection between images', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.addImage(mockImage2);
      });

      act(() => {
        result.current.selectImage('img1');
      });

      expect(result.current.images[0].selected).toBe(true);
      expect(result.current.images[1].selected).toBe(false);

      act(() => {
        result.current.selectImage('img2');
      });

      expect(result.current.images[0].selected).toBe(false);
      expect(result.current.images[1].selected).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should clear all state', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.selectImage('img1');
        result.current.setCurrentPrompt('test prompt');
        result.current.setIsOrganizing(true);
        result.current.setErrorModal('test error');
      });

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.images).toEqual([]);
      expect(result.current.selectedImageId).toBe(null);
      expect(result.current.selectedImage).toBe(undefined);
      expect(result.current.currentPrompt).toBe('');
      // Note: clearAll doesn't reset isOrganizing - that's handled separately
      expect(result.current.error).toBe(null);
    });
  });

  describe('setters', () => {
    it('should set images', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.setImages([mockImage1, mockImage2]);
      });

      expect(result.current.images).toEqual([mockImage1, mockImage2]);
    });

    it('should set current prompt', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.setCurrentPrompt('test prompt');
      });

      expect(result.current.currentPrompt).toBe('test prompt');
    });

    it('should set organizing state', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.setIsOrganizing(true);
      });

      expect(result.current.isOrganizing).toBe(true);
    });

    it('should set error', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.setErrorModal('test error');
      });

      expect(result.current.error).toBe('test error');
    });
  });

  describe('dismissError', () => {
    it('should dismiss error', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.setErrorModal('test error');
      });

      expect(result.current.error).toBe('test error');

      act(() => {
        result.current.dismissError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('selectedImage computed value', () => {
    it('should return undefined when no image is selected', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
      });

      expect(result.current.selectedImage).toBe(undefined);
    });

    it('should return the selected image', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.selectImage('img1');
      });

      expect(result.current.selectedImage).toEqual({
        ...mockImage1,
        selected: true,
      });
    });

    it('should return undefined when selected image is deleted', () => {
      const { result } = renderHook(() => useCanvasState());

      act(() => {
        result.current.addImage(mockImage1);
        result.current.selectImage('img1');
      });

      expect(result.current.selectedImage).toBeDefined();

      act(() => {
        result.current.deleteImage('img1');
      });

      expect(result.current.selectedImage).toBe(undefined);
    });
  });
}); 