import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { VocabularyProvider } from '../../contexts/VocabularyContext';
import { ProgressProvider } from '../../contexts/ProgressContext';
import Practice from '../../pages/Practice';

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

// Mock fetch
global.fetch = vi.fn();

// Mock audio APIs
global.Audio = vi.fn(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Mock timers
vi.useFakeTimers();

// Test wrapper
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

describe('Practice Flow Integration Tests', () => {
  const mockVocabulary = [
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
    {
      id: '2',
      word: 'DeFi',
      definition: 'Decentralized Finance',
      pronunciation: '/ˈdiːfaɪ/',
      audioUrl: 'https://example.com/audio/defi.mp3',
      examples: ['DeFi protocols enable lending without banks'],
      category: 'DEFI',
      difficulty: 'INTERMEDIATE',
      tags: ['finance', 'defi'],
      isCustom: false,
      studyCount: 0,
      accuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      word: 'NFT',
      definition: 'Non-Fungible Token',
      pronunciation: '/ˌenˌefˈtiː/',
      audioUrl: 'https://example.com/audio/nft.mp3',
      examples: ['NFTs represent unique digital assets'],
      category: 'NFT',
      difficulty: 'BEGINNER',
      tags: ['token', 'digital'],
      isCustom: false,
      studyCount: 0,
      accuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      vocabulary: mockVocabulary,
      favorites: [],
      currentWord: null,
    }));

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        vocabulary: mockVocabulary,
        total: mockVocabulary.length,
      }),
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Quick Practice Flow', () => {
    it('should complete a quick practice session', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Start quick practice
      const quickPracticeButton = screen.getByText(/快速练习|quick practice/i);
      fireEvent.click(quickPracticeButton);

      await waitFor(() => {
        expect(screen.getByText(/题目|question/i)).toBeInTheDocument();
      });

      // Should show first question
      expect(screen.getByText(/Blockchain|DeFi|NFT/)).toBeInTheDocument();

      // Answer the question (assuming multiple choice)
      const options = screen.getAllByRole('button');
      const answerOption = options.find(option => 
        option.textContent?.includes('distributed ledger') ||
        option.textContent?.includes('Decentralized Finance') ||
        option.textContent?.includes('Non-Fungible Token')
      );

      if (answerOption) {
        fireEvent.click(answerOption);

        await waitFor(() => {
          expect(screen.getByText(/正确|错误|correct|incorrect/i)).toBeInTheDocument();
        });

        // Continue to next question
        const nextButton = screen.getByText(/下一题|next/i);
        fireEvent.click(nextButton);
      }

      // Complete the practice session
      await waitFor(() => {
        expect(screen.getByText(/完成|complete|结果|results/i)).toBeInTheDocument();
      });
    });

    it('should handle timed practice with countdown', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Start timed practice
      const timedPracticeButton = screen.getByText(/计时练习|timed practice/i);
      fireEvent.click(timedPracticeButton);

      await waitFor(() => {
        expect(screen.getByText(/倒计时|countdown|timer/i)).toBeInTheDocument();
      });

      // Should show timer
      expect(screen.getByText(/\d+:\d+|\d+秒/)).toBeInTheDocument();

      // Fast-forward time
      vi.advanceTimersByTime(30000); // 30 seconds

      await waitFor(() => {
        // Timer should update
        expect(screen.getByText(/\d+:\d+|\d+秒/)).toBeInTheDocument();
      });

      // Fast-forward to end of time
      vi.advanceTimersByTime(300000); // 5 minutes

      await waitFor(() => {
        // Should auto-submit when time runs out
        expect(screen.getByText(/时间到|time up|完成|complete/i)).toBeInTheDocument();
      });
    });

    it('should save progress during practice', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Start practice
      const practiceButton = screen.getByText(/开始练习|start practice/i);
      fireEvent.click(practiceButton);

      await waitFor(() => {
        expect(screen.getByText(/题目|question/i)).toBeInTheDocument();
      });

      // Answer a question correctly
      const correctAnswer = screen.getByText(/distributed ledger|Decentralized Finance|Non-Fungible Token/i);
      fireEvent.click(correctAnswer);

      // Progress should be saved to localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('progress'),
        expect.stringContaining('correct')
      );
    });
  });

  describe('Review Practice Flow', () => {
    it('should practice only incorrect words', async () => {
      // Mock progress data with some incorrect answers
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        vocabulary: mockVocabulary,
        progress: {
          incorrectWords: ['1', '2'], // Blockchain and DeFi were answered incorrectly
          wordStats: {
            '1': { correct: 2, incorrect: 3, accuracy: 0.4 },
            '2': { correct: 1, incorrect: 4, accuracy: 0.2 },
            '3': { correct: 5, incorrect: 0, accuracy: 1.0 },
          },
        },
      }));

      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Start review practice
      const reviewButton = screen.getByText(/复习练习|review practice/i);
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/复习模式|review mode/i)).toBeInTheDocument();
      });

      // Should only show words that were answered incorrectly
      expect(screen.getByText(/Blockchain|DeFi/)).toBeInTheDocument();
      expect(screen.queryByText('NFT')).not.toBeInTheDocument();
    });

    it('should show no review needed when all words are mastered', async () => {
      // Mock progress data with all correct answers
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        vocabulary: mockVocabulary,
        progress: {
          incorrectWords: [],
          wordStats: {
            '1': { correct: 5, incorrect: 0, accuracy: 1.0 },
            '2': { correct: 5, incorrect: 0, accuracy: 1.0 },
            '3': { correct: 5, incorrect: 0, accuracy: 1.0 },
          },
        },
      }));

      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      const reviewButton = screen.getByText(/复习练习|review practice/i);
      fireEvent.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/没有需要复习|no review needed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Practice Settings', () => {
    it('should allow customizing practice settings', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Open settings
      const settingsButton = screen.getByText(/设置|settings/i);
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText(/练习设置|practice settings/i)).toBeInTheDocument();
      });

      // Change question count
      const questionCountInput = screen.getByLabelText(/题目数量|question count/i);
      fireEvent.change(questionCountInput, { target: { value: '20' } });

      // Change difficulty filter
      const difficultySelect = screen.getByLabelText(/难度|difficulty/i);
      fireEvent.change(difficultySelect, { target: { value: 'BEGINNER' } });

      // Change category filter
      const categorySelect = screen.getByLabelText(/分类|category/i);
      fireEvent.change(categorySelect, { target: { value: 'BLOCKCHAIN' } });

      // Save settings
      const saveButton = screen.getByText(/保存|save/i);
      fireEvent.click(saveButton);

      // Settings should be saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('practice-settings'),
        expect.stringContaining('20')
      );
    });

    it('should apply filters to practice questions', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Set filter to only BEGINNER difficulty
      const settingsButton = screen.getByText(/设置|settings/i);
      fireEvent.click(settingsButton);

      await waitFor(() => {
        const difficultySelect = screen.getByLabelText(/难度|difficulty/i);
        fireEvent.change(difficultySelect, { target: { value: 'BEGINNER' } });

        const saveButton = screen.getByText(/保存|save/i);
        fireEvent.click(saveButton);
      });

      // Start practice
      const practiceButton = screen.getByText(/开始练习|start practice/i);
      fireEvent.click(practiceButton);

      await waitFor(() => {
        // Should only show BEGINNER level words (Blockchain and NFT)
        expect(screen.getByText(/Blockchain|NFT/)).toBeInTheDocument();
        // Should not show INTERMEDIATE words (DeFi)
        expect(screen.queryByText('DeFi')).not.toBeInTheDocument();
      });
    });
  });

  describe('Practice Statistics', () => {
    it('should track and display practice statistics', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Start practice
      const practiceButton = screen.getByText(/开始练习|start practice/i);
      fireEvent.click(practiceButton);

      await waitFor(() => {
        expect(screen.getByText(/题目|question/i)).toBeInTheDocument();
      });

      // Answer questions and complete practice
      for (let i = 0; i < 3; i++) {
        const correctAnswer = screen.getByText(/distributed ledger|Decentralized Finance|Non-Fungible Token/i);
        fireEvent.click(correctAnswer);

        await waitFor(() => {
          const nextButton = screen.queryByText(/下一题|next/i);
          if (nextButton) {
            fireEvent.click(nextButton);
          }
        });
      }

      // Should show results
      await waitFor(() => {
        expect(screen.getByText(/练习结果|practice results/i)).toBeInTheDocument();
        expect(screen.getByText(/正确率|accuracy/i)).toBeInTheDocument();
        expect(screen.getByText(/用时|time spent/i)).toBeInTheDocument();
      });

      // Statistics should be saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('progress'),
        expect.any(String)
      );
    });

    it('should show detailed performance breakdown', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Complete a practice session
      const practiceButton = screen.getByText(/开始练习|start practice/i);
      fireEvent.click(practiceButton);

      // Answer some questions correctly and some incorrectly
      await waitFor(() => {
        expect(screen.getByText(/题目|question/i)).toBeInTheDocument();
      });

      // Simulate mixed results
      const correctAnswer = screen.getByText(/distributed ledger|Decentralized Finance|Non-Fungible Token/i);
      fireEvent.click(correctAnswer);

      await waitFor(() => {
        const nextButton = screen.getByText(/下一题|next/i);
        fireEvent.click(nextButton);
      });

      // Complete practice
      await waitFor(() => {
        expect(screen.getByText(/练习结果|practice results/i)).toBeInTheDocument();
      });

      // Should show breakdown by category and difficulty
      expect(screen.getByText(/分类统计|category breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/难度统计|difficulty breakdown/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling in Practice', () => {
    it('should handle practice interruption gracefully', async () => {
      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });

      // Start practice
      const practiceButton = screen.getByText(/开始练习|start practice/i);
      fireEvent.click(practiceButton);

      await waitFor(() => {
        expect(screen.getByText(/题目|question/i)).toBeInTheDocument();
      });

      // Simulate interruption (e.g., user navigates away)
      const exitButton = screen.getByText(/退出|exit/i);
      fireEvent.click(exitButton);

      await waitFor(() => {
        expect(screen.getByText(/确认退出|confirm exit/i)).toBeInTheDocument();
      });

      // Confirm exit
      const confirmButton = screen.getByText(/确认|confirm/i);
      fireEvent.click(confirmButton);

      // Should save partial progress
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('progress'),
        expect.any(String)
      );
    });

    it('should handle network errors during practice', async () => {
      // Mock network failure
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <Practice />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/网络错误|network error/i)).toBeInTheDocument();
      });

      // Should show retry option
      expect(screen.getByText(/重试|retry/i)).toBeInTheDocument();

      // Retry should work when network is restored
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          vocabulary: mockVocabulary,
          total: mockVocabulary.length,
        }),
      } as Response);

      const retryButton = screen.getByText(/重试|retry/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/练习模式|practice mode/i)).toBeInTheDocument();
      });
    });
  });
});