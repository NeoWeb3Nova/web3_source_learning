import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { VocabularyProvider } from '../../contexts/VocabularyContext';
import { ProgressProvider } from '../../contexts/ProgressContext';
import { ErrorProvider } from '../../contexts/ErrorContext';
import theme from '../../theme';

// Custom render function with all providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ChakraProvider theme={theme}>
        <ErrorProvider>
          <VocabularyProvider>
            <ProgressProvider>
              {children}
            </ProgressProvider>
          </VocabularyProvider>
        </ErrorProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockVocabularyItem = (overrides = {}) => ({
  id: '1',
  word: 'Blockchain',
  definition: 'A distributed ledger technology',
  pronunciation: '/ˈblɒktʃeɪn/',
  audioUrl: 'https://example.com/audio/blockchain.mp3',
  examples: ['Bitcoin uses blockchain technology'],
  category: 'BLOCKCHAIN',
  difficulty: 'BEGINNER',
  tags: ['technology', 'crypto'],
  isCustom: false,
  studyCount: 0,
  accuracy: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockQuizQuestion = (overrides = {}) => ({
  id: '1',
  type: 'MULTIPLE_CHOICE',
  question: 'What is blockchain?',
  options: ['A distributed ledger', 'A database', 'A network', 'All of the above'],
  correctAnswer: 'A distributed ledger',
  explanation: 'Blockchain is a distributed ledger technology',
  difficulty: 'BEGINNER',
  category: 'BLOCKCHAIN',
  timeLimit: 30,
  ...overrides,
});

export const createMockProgressData = (overrides = {}) => ({
  totalStudied: 10,
  correctAnswers: 8,
  streak: 3,
  longestStreak: 5,
  studyTime: 1800, // 30 minutes in seconds
  achievements: ['first_word', 'week_streak'],
  dailyStats: [
    { date: '2024-01-01', studied: 5, correct: 4, timeSpent: 600 },
    { date: '2024-01-02', studied: 3, correct: 3, timeSpent: 400 },
    { date: '2024-01-03', studied: 2, correct: 1, timeSpent: 800 },
  ],
  ...overrides,
});

// Mock implementations
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

export const mockAudioContext = {
  createBufferSource: vi.fn(),
  createGain: vi.fn(),
  decodeAudioData: vi.fn(),
  destination: {},
  state: 'running',
  suspend: vi.fn(),
  resume: vi.fn(),
  close: vi.fn(),
};

export const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  duration: 2.5,
  paused: true,
  ended: false,
  volume: 1,
  muted: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

export const mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Setup global mocks
export const setupGlobalMocks = () => {
  // localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  // Audio APIs
  global.Audio = vi.fn(() => mockAudio) as any;
  global.AudioContext = vi.fn(() => mockAudioContext) as any;
  global.webkitAudioContext = vi.fn(() => mockAudioContext) as any;

  // matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  // IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;

  // ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;

  // fetch
  global.fetch = vi.fn();
};

// Cleanup mocks
export const cleanupMocks = () => {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue(null);
};

// Wait for async operations
export const waitForAsyncOperations = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Simulate user interactions
export const simulateSwipe = (element: Element, direction: 'left' | 'right' | 'up' | 'down') => {
  const startCoords = { x: 100, y: 100 };
  const endCoords = {
    left: { x: 50, y: 100 },
    right: { x: 150, y: 100 },
    up: { x: 100, y: 50 },
    down: { x: 100, y: 150 },
  }[direction];

  fireEvent.touchStart(element, {
    touches: [{ clientX: startCoords.x, clientY: startCoords.y }],
  });

  fireEvent.touchMove(element, {
    touches: [{ clientX: endCoords.x, clientY: endCoords.y }],
  });

  fireEvent.touchEnd(element, {
    changedTouches: [{ clientX: endCoords.x, clientY: endCoords.y }],
  });
};

export const simulateLongPress = (element: Element, duration = 500) => {
  fireEvent.touchStart(element);
  
  return new Promise(resolve => {
    setTimeout(() => {
      fireEvent.touchEnd(element);
      resolve(undefined);
    }, duration);
  });
};

// Viewport simulation
export const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  fireEvent(window, new Event('resize'));
};

// Network simulation
export const simulateOffline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  });
  
  window.dispatchEvent(new Event('offline'));
};

export const simulateOnline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });
  
  window.dispatchEvent(new Event('online'));
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitForAsyncOperations();
  const end = performance.now();
  return end - start;
};

export const measureMemoryUsage = () => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Basic accessibility checks
  const issues: string[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image ${index} missing alt text`);
    }
  });

  // Check for missing labels on form controls
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    container.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      issues.push(`Form control ${index} missing label`);
    }
  });

  // Check for proper heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      issues.push(`Heading ${index} skips levels (h${previousLevel} to h${level})`);
    }
    previousLevel = level;
  });

  return issues;
};

// Custom matchers
export const customMatchers = {
  toBeAccessible: (received: HTMLElement) => {
    const issues = checkAccessibility(received);
    return {
      message: () => `Expected element to be accessible, but found issues: ${issues.join(', ')}`,
      pass: issues.length === 0,
    };
  },
  
  toHaveValidContrast: (received: HTMLElement) => {
    // This would require actual color contrast calculation
    // For now, just check if contrast-related classes are present
    const hasContrastClass = received.classList.toString().includes('contrast');
    return {
      message: () => `Expected element to have valid color contrast`,
      pass: hasContrastClass,
    };
  },
};

// Extend expect with custom matchers
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeAccessible(): any;
      toHaveValidContrast(): any;
    }
  }
}

// Export vi for convenience
export { vi } from 'vitest';
export { fireEvent } from '@testing-library/react';