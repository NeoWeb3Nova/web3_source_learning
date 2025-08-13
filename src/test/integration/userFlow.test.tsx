import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import App from '../../App';
import { VocabularyProvider } from '../../contexts/VocabularyContext';
import { ProgressProvider } from '../../contexts/ProgressContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock audio APIs
global.Audio = vi.fn(() => ({
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
})) as any;

// Mock Web Audio API
const mockAudioContext = {
  createBufferSource: vi.fn(),
  createGain: vi.fn(),
  decodeAudioData: vi.fn(),
  destination: {},
  state: 'running',
  suspend: vi.fn(),
  resume: vi.fn(),
  close: vi.fn(),
};

global.AudioContext = vi.fn(() => mockAudioContext) as any;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Test wrapper with all providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <ChakraProvider>
      <VocabularyProvider>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </VocabularyProvider>
    </ChakraProvider>
  </BrowserRouter>
);

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Mock successful API responses
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        vocabulary: [
          {
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 1,
      }),
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Learning Flow', () => {
    it('should complete a full vocabulary learning session', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByText(/Web3.*DeFi.*词汇大作战/i)).toBeInTheDocument();
      });

      // Navigate to vocabulary section
      const vocabTab = screen.getByRole('tab', { name: /词汇|vocabulary/i });
      fireEvent.click(vocabTab);

      await waitFor(() => {
        expect(screen.getByText('Blockchain')).toBeInTheDocument();
      });

      // Interact with word card
      const wordCard = screen.getByText('Blockchain').closest('[role="button"]');
      if (wordCard) {
        fireEvent.click(wordCard);
        
        await waitFor(() => {
          expect(screen.getByText('A distributed ledger technology')).toBeInTheDocument();
        });
      }

      // Add to favorites
      const favoriteButton = screen.getByLabelText(/收藏|favorite/i);
      fireEvent.click(favoriteButton);

      // Play audio
      const audioButton = screen.getByLabelText(/播放发音|play audio/i);
      fireEvent.click(audioButton);

      // Navigate to practice
      const practiceTab = screen.getByRole('tab', { name: /练习|practice/i });
      fireEvent.click(practiceTab);

      await waitFor(() => {
        expect(screen.getByText(/开始练习|start practice/i)).toBeInTheDocument();
      });

      // Start a quiz
      const startQuizButton = screen.getByText(/开始练习|start practice/i);
      fireEvent.click(startQuizButton);

      // Complete quiz (this would depend on the actual quiz implementation)
      await waitFor(() => {
        // Look for quiz questions or completion message
        expect(screen.getByText(/题目|question|完成|complete/i)).toBeInTheDocument();
      });

      // Check progress
      const progressTab = screen.getByRole('tab', { name: /进度|progress/i });
      fireEvent.click(progressTab);

      await waitFor(() => {
        expect(screen.getByText(/学习统计|learning stats/i)).toBeInTheDocument();
      });
    });

    it('should handle vocabulary addition flow', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Web3.*DeFi.*词汇大作战/i)).toBeInTheDocument();
      });

      // Navigate to vocabulary section
      const vocabTab = screen.getByRole('tab', { name: /词汇|vocabulary/i });
      fireEvent.click(vocabTab);

      // Find and click add vocabulary button
      const addButton = screen.getByText(/添加词汇|add vocabulary/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill in the form
      const wordInput = screen.getByLabelText(/单词|word/i);
      const definitionInput = screen.getByLabelText(/定义|definition/i);

      fireEvent.change(wordInput, { target: { value: 'DeFi' } });
      fireEvent.change(definitionInput, { target: { value: 'Decentralized Finance' } });

      // Submit the form
      const submitButton = screen.getByText(/保存|save|添加|add/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('DeFi')).toBeInTheDocument();
      });
    });

    it('should handle error states gracefully', async () => {
      // Mock API failure
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show error message or fallback content
        expect(screen.getByText(/错误|error|网络|network/i)).toBeInTheDocument();
      });

      // Should allow retry
      const retryButton = screen.queryByText(/重试|retry/i);
      if (retryButton) {
        fireEvent.click(retryButton);
      }
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between all main sections', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Web3.*DeFi.*词汇大作战/i)).toBeInTheDocument();
      });

      // Test navigation to each section
      const sections = [
        { name: /词汇|vocabulary/i, content: /单词|word/i },
        { name: /练习|practice/i, content: /练习|practice|quiz/i },
        { name: /进度|progress/i, content: /统计|stats|progress/i },
        { name: /设置|settings/i, content: /设置|settings|preferences/i },
      ];

      for (const section of sections) {
        const tab = screen.getByRole('tab', { name: section.name });
        fireEvent.click(tab);

        await waitFor(() => {
          expect(screen.getByText(section.content)).toBeInTheDocument();
        });
      }
    });

    it('should maintain state across navigation', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Web3.*DeFi.*词汇大作战/i)).toBeInTheDocument();
      });

      // Navigate to vocabulary and add to favorites
      const vocabTab = screen.getByRole('tab', { name: /词汇|vocabulary/i });
      fireEvent.click(vocabTab);

      await waitFor(() => {
        const favoriteButton = screen.getByLabelText(/收藏|favorite/i);
        fireEvent.click(favoriteButton);
      });

      // Navigate away and back
      const practiceTab = screen.getByRole('tab', { name: /练习|practice/i });
      fireEvent.click(practiceTab);

      fireEvent.click(vocabTab);

      // Favorite state should be maintained
      await waitFor(() => {
        const favoriteButton = screen.getByLabelText(/收藏|favorite/i);
        expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show mobile layout
        expect(screen.getByRole('navigation')).toHaveClass(/mobile|bottom/);
      });
    });

    it('should adapt to tablet viewport', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show tablet layout
        expect(screen.getByRole('navigation')).toHaveClass(/tablet|side/);
      });
    });

    it('should handle orientation changes', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', { value: 667, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, configurable: true });
      
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        // Layout should adapt to landscape
        expect(document.body).toHaveClass(/landscape/);
      });
    });
  });

  describe('Accessibility Flow', () => {
    it('should support keyboard navigation throughout the app', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Web3.*DeFi.*词汇大作战/i)).toBeInTheDocument();
      });

      // Tab through navigation
      const firstTab = screen.getAllByRole('tab')[0];
      firstTab.focus();
      expect(firstTab).toHaveFocus();

      // Use arrow keys to navigate tabs
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      
      const secondTab = screen.getAllByRole('tab')[1];
      expect(secondTab).toHaveFocus();
    });

    it('should announce important changes to screen readers', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for aria-live regions
        const liveRegions = screen.getAllByRole('status');
        expect(liveRegions.length).toBeGreaterThan(0);
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toBeInTheDocument();
        
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Performance and Loading', () => {
    it('should show loading states during data fetching', async () => {
      // Mock slow API response
      vi.mocked(fetch).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ vocabulary: [], total: 0 }),
          } as Response), 1000)
        )
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show loading indicator
      expect(screen.getByText(/加载|loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/加载|loading/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle offline scenarios', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/离线|offline/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence', () => {
    it('should save and restore user progress', async () => {
      // Mock existing data in localStorage
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        vocabulary: [
          {
            id: '1',
            word: 'Blockchain',
            definition: 'A distributed ledger technology',
            studyCount: 5,
            accuracy: 0.8,
          },
        ],
        progress: {
          totalStudied: 10,
          streak: 3,
          achievements: ['first_word', 'week_streak'],
        },
      }));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should restore previous state
        expect(screen.getByText(/连续学习.*3.*天/i)).toBeInTheDocument();
      });
    });

    it('should handle corrupted localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should not crash and show default state
        expect(screen.getByText(/Web3.*DeFi.*词汇大作战/i)).toBeInTheDocument();
      });
    });
  });
});