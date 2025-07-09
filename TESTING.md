# Testing Guide for AI Canvas

This document describes the testing setup and structure for the AI Canvas project.

## Test Setup

The project uses **Jest** and **React Testing Library** for testing, with TypeScript support.

### Dependencies

- `jest` - JavaScript testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM elements
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - Browser-like environment for tests
- `ts-jest` - TypeScript support for Jest

### Configuration

- **Jest config**: `jest.config.js` - Main Jest configuration with Next.js support
- **Setup file**: `jest.setup.js` - Global test setup and mocks
- **TypeScript**: `src/types/jest.d.ts` - Type definitions for Jest matchers

## Test Structure

### Test Organization

Tests are organized alongside the code they test in `__tests__` directories:

```
src/
├── services/
│   ├── __tests__/
│   │   ├── aiService.test.ts
│   │   └── documentService.test.ts
│   ├── aiService.ts
│   └── documentService.ts
├── hooks/
│   ├── __tests__/
│   │   ├── useCanvasState.test.ts
│   │   └── useCanvasLayout.test.ts
│   └── [hooks...]
├── components/
│   ├── __tests__/
│   │   └── PromptInput.test.tsx
│   └── [components...]
└── lib/
    ├── __tests__/
    │   └── errors.test.ts
    └── [utilities...]
```

### Test Categories

1. **Service Tests** (`src/services/__tests__/`)
   - Unit tests for API services
   - Mock axios for HTTP requests
   - Test success and error scenarios

2. **Hook Tests** (`src/hooks/__tests__/`)
   - Test custom React hooks
   - Use `renderHook` from React Testing Library
   - Test state changes and side effects

3. **Component Tests** (`src/components/__tests__/`)
   - Test React components
   - Test user interactions and rendering
   - Test accessibility features

4. **Utility Tests** (`src/lib/__tests__/`)
   - Test utility functions
   - Test error handling
   - Test data transformations

## Running Tests

### Available Scripts

```bash
# Run all tests once
npm test

# Run tests with coverage report
npm run test:coverage
```


## Test Examples

### Service Test Example

```typescript
// src/services/__tests__/aiService.test.ts
import axios from 'axios';
import { AIService } from '../aiService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate image successfully', async () => {
    const mockResponse = {
      data: { imageUrl: 'https://example.com/image.jpg' }
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await AIService.generateImage('test prompt');

    expect(result).toEqual({
      success: true,
      imageUrl: 'https://example.com/image.jpg'
    });
  });
});
```

### Hook Test Example

```typescript
// src/hooks/__tests__/useCanvasState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCanvasState } from '../useCanvasState';

describe('useCanvasState', () => {
  it('should add image to state', () => {
    const { result } = renderHook(() => useCanvasState());

    act(() => {
      result.current.addImage(mockImage);
    });

    expect(result.current.images).toContain(mockImage);
  });
});
```

### Component Test Example

```typescript
// src/components/__tests__/PromptInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PromptInput from '../PromptInput';

describe('PromptInput', () => {
  it('should call onChange when user types', () => {
    const mockOnChange = jest.fn();
    render(<PromptInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });
});
```

## Mocking Strategy

### Global Mocks (jest.setup.js)

- **Next.js Router**: Mocked for navigation testing
- **Window APIs**: matchMedia, IntersectionObserver, ResizeObserver
- **Clipboard API**: For copy/paste functionality testing
- **Fetch API**: For HTTP request testing
- **Image Constructor**: For image loading testing

### Test-Specific Mocks

- **Axios**: Mocked in service tests for HTTP requests
- **Timers**: Mocked in tests that use setTimeout/setInterval
- **Window dimensions**: Mocked for responsive layout testing


## Test Files Overview

### Currently Implemented

1. **aiService.test.ts**: Tests for AI image generation and prompt variations
2. **documentService.test.ts**: Tests for document saving, loading, and management
3. **useCanvasState.test.ts**: Tests for canvas state management hook
4. **useCanvasLayout.test.ts**: Tests for canvas layout and grid organization
5. **PromptInput.test.tsx**: Tests for the prompt input component
6. **errors.test.ts**: Tests for error handling utilities

### Test Coverage Areas

- ✅ Service layer (API interactions)
- ✅ Custom hooks (state management)
- ✅ Basic components (form inputs)
- ✅ Utility functions (error handling)
- ⚠️ Complex components (canvas, image tiles) - Can be added
- ⚠️ Integration tests - Can be added
- ⚠️ E2E tests - Can be added with tools like Cypress


## Next Steps

To expand the test suite, consider adding:

1. **Integration Tests**: Test component interactions and data flow
2. **Visual Regression Tests**: Test UI consistency across changes
3. **Performance Tests**: Test performance of critical operations
4. **Accessibility Tests**: Test keyboard navigation and screen reader support
5. **E2E Tests**: Test complete user workflows

This testing foundation provides a solid base for maintaining code quality and preventing regressions as the project evolves. 