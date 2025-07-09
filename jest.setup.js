import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Note: window.location mocking removed due to jsdom conflicts

// Mock fetch
global.fetch = jest.fn()

// Mock Image constructor for preloading tests
global.Image = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: '',
  onload: null,
  onerror: null,
}))

// Suppress console.error for cleaner test output during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Suppress React warnings
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOMTestUtils.act is deprecated')
    ) {
      return
    }
    
    // Suppress expected error logging from services during tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error saving document:') ||
       args[0].includes('Error loading document:') ||
       args[0].includes('Error updating document:') ||
       args[0].includes('Error generating image:') ||
       args[0].includes('Error generating prompt variations:'))
    ) {
      return
    }
    
    // Let other errors through (uncomment next line if you want to see all errors)
    // originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 