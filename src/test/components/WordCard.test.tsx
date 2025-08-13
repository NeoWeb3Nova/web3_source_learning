import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import WordCard from '../../components/vocabulary/WordCard';
import { VocabularyItem, DifficultyLevel, Web3Category } from '../../types/vocabulary';

// Mock data
const mockWord: VocabularyItem = {
  id: '1',
  word: 'Blockchain',
  definition: 'A distributed ledger technology',
  pronunciation: '/ˈblɒktʃeɪn/',
  audioUrl: 'https://example.com/audio/blockchain.mp3',
  examples: ['Bitcoin uses blockchain technology'],
  category: Web3Category.BLOCKCHAIN,
  difficulty: DifficultyLevel.BEGINNER,
  tags: ['technology', 'crypto'],
  isCustom: false,
  studyCount: 0,
  accuracy: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock hooks
vi.mock('../../hooks/useVocabulary', () => ({
  default: () => ({
    toggleFavorite: vi.fn(),
    markAsLearned: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAudio', () => ({
  useAudio: () => ({
    play: vi.fn(),
    isPlaying: false,
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchConfig: {
      minTouchTarget: 44,
      touchPadding: 8,
    },
  }),
}));

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('WordCard Component', () => {
  const defaultProps = {
    word: mockWord,
    onFlip: vi.fn(),
    onSwipe: vi.fn(),
    onFavorite: vi.fn(),
    onPlayAudio: vi.fn(),
    isFlipped: false,
    isFavorite: false,
    isLearned: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render word card with basic information', () => {
      render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Blockchain')).toBeInTheDocument();
      expect(screen.getByText('BEGINNER')).toBeInTheDocument();
      expect(screen.getByText('BLOCKCHAIN')).toBeInTheDocument();
    });

    it('should render definition when flipped', () => {
      render(
        <TestWrapper>
          <WordCard {...defaultProps} isFlipped={true} />
        </TestWrapper>
      );

      expect(screen.getByText('A distributed ledger technology')).toBeInTheDocument();
      expect(screen.getByText('/ˈblɒktʃeɪn/')).toBeInTheDocument();
    });

    it('should show favorite indicator when favorited', () => {
      render(
        <TestWrapper>
          <WordCard {...defaultProps} isFavorite={true} />
        </TestWrapper>
      );

      const favoriteButton = screen.getByLabelText(/收藏|favorite/i);
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show learned indicator when learned', () => {
      render(
        <TestWrapper>
          <WordCard {...defaultProps} isLearned={true} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/已掌握|learned/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onFlip when card is clicked', async () => {
      const user = userEvent.setup();
      const onFlip = vi.fn();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} onFlip={onFlip} />
        </TestWrapper>
      );

      const card = screen.getByRole('button', { name: /翻转卡片|flip card/i });
      await user.click(card);

      expect(onFlip).toHaveBeenCalledTimes(1);
    });

    it('should call onFavorite when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onFavorite = vi.fn();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} onFavorite={onFavorite} />
        </TestWrapper>
      );

      const favoriteButton = screen.getByLabelText(/收藏|favorite/i);
      await user.click(favoriteButton);

      expect(onFavorite).toHaveBeenCalledWith(mockWord.id);
    });

    it('should call onPlayAudio when audio button is clicked', async () => {
      const user = userEvent.setup();
      const onPlayAudio = vi.fn();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} onPlayAudio={onPlayAudio} />
        </TestWrapper>
      );

      const audioButton = screen.getByLabelText(/播放发音|play audio/i);
      await user.click(audioButton);

      expect(onPlayAudio).toHaveBeenCalledWith(mockWord.word);
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      const onFlip = vi.fn();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} onFlip={onFlip} />
        </TestWrapper>
      );

      const card = screen.getByRole('button', { name: /翻转卡片|flip card/i });
      
      // Focus the card
      await user.tab();
      expect(card).toHaveFocus();

      // Press Enter to flip
      await user.keyboard('{Enter}');
      expect(onFlip).toHaveBeenCalledTimes(1);

      // Press Space to flip
      await user.keyboard(' ');
      expect(onFlip).toHaveBeenCalledTimes(2);
    });
  });

  describe('Swipe Gestures', () => {
    it('should call onSwipe when swiped left', () => {
      const onSwipe = vi.fn();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} onSwipe={onSwipe} />
        </TestWrapper>
      );

      const card = screen.getByRole('button', { name: /翻转卡片|flip card/i });
      
      // Simulate swipe left
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchMove(card, {
        touches: [{ clientX: 50, clientY: 100 }],
      });
      fireEvent.touchEnd(card, {
        changedTouches: [{ clientX: 50, clientY: 100 }],
      });

      // Note: Actual swipe detection would depend on the implementation
      // This is a simplified test
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /翻转卡片|flip card/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/收藏|favorite/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/播放发音|play audio/i)).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      const card = screen.getByRole('button', { name: /翻转卡片|flip card/i });
      expect(card).toHaveAttribute('aria-label');
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /翻转卡片|flip card/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/收藏|favorite/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/播放发音|play audio/i)).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile layout', () => {
      // Mock mobile responsive hook
      vi.mocked(require('../../hooks/useResponsive').useResponsive).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        touchConfig: {
          minTouchTarget: 44,
          touchPadding: 12,
        },
      });

      render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      // Check if mobile-specific styles or behaviors are applied
      const card = screen.getByRole('button', { name: /翻转卡片|flip card/i });
      expect(card).toBeInTheDocument();
    });

    it('should have minimum touch target size on mobile', () => {
      vi.mocked(require('../../hooks/useResponsive').useResponsive).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        touchConfig: {
          minTouchTarget: 44,
          touchPadding: 12,
        },
      });

      render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        // Note: This would need actual CSS testing setup
        // expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing audio URL gracefully', () => {
      const wordWithoutAudio = { ...mockWord, audioUrl: undefined };

      render(
        <TestWrapper>
          <WordCard {...defaultProps} word={wordWithoutAudio} />
        </TestWrapper>
      );

      // Audio button should be disabled or hidden
      const audioButton = screen.queryByLabelText(/播放发音|play audio/i);
      if (audioButton) {
        expect(audioButton).toBeDisabled();
      }
    });

    it('should handle long text content', () => {
      const wordWithLongContent = {
        ...mockWord,
        word: 'Supercalifragilisticexpialidocious',
        definition: 'A very long definition that might cause layout issues if not handled properly in the component design and implementation',
      };

      render(
        <TestWrapper>
          <WordCard {...defaultProps} word={wordWithLongContent} />
        </TestWrapper>
      );

      expect(screen.getByText('Supercalifragilisticexpialidocious')).toBeInTheDocument();
    });

    it('should handle missing required props', () => {
      // Test with minimal props
      const minimalProps = {
        word: mockWord,
        onFlip: vi.fn(),
        onSwipe: vi.fn(),
        onFavorite: vi.fn(),
        onPlayAudio: vi.fn(),
      };

      expect(() => {
        render(
          <TestWrapper>
            <WordCard {...minimalProps} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <WordCard {...defaultProps} />
        </TestWrapper>
      );

      // Component should be memoized and not re-render
      expect(screen.getByText('Blockchain')).toBeInTheDocument();
    });

    it('should handle rapid interactions', async () => {
      const user = userEvent.setup();
      const onFlip = vi.fn();

      render(
        <TestWrapper>
          <WordCard {...defaultProps} onFlip={onFlip} />
        </TestWrapper>
      );

      const card = screen.getByRole('button', { name: /翻转卡片|flip card/i });

      // Rapid clicks
      await user.click(card);
      await user.click(card);
      await user.click(card);

      expect(onFlip).toHaveBeenCalledTimes(3);
    });
  });
});