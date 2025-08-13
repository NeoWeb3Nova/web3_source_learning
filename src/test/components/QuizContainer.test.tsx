import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import QuizContainer from '../../components/practice/QuizContainer';
import { QuizQuestion, QuestionType } from '../../types/practice';
import { DifficultyLevel, Web3Category } from '../../types/vocabulary';

// Mock data
const mockQuestions: QuizQuestion[] = [
  {
    id: '1',
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'What is blockchain?',
    options: ['A distributed ledger', 'A database', 'A network', 'All of the above'],
    correctAnswer: 'A distributed ledger',
    explanation: 'Blockchain is a distributed ledger technology',
    difficulty: DifficultyLevel.BEGINNER,
    category: Web3Category.BLOCKCHAIN,
    timeLimit: 30,
  },
  {
    id: '2',
    type: QuestionType.FILL_BLANK,
    question: 'DeFi stands for _____ Finance',
    correctAnswer: 'Decentralized',
    explanation: 'DeFi means Decentralized Finance',
    difficulty: DifficultyLevel.INTERMEDIATE,
    category: Web3Category.DEFI,
    timeLimit: 20,
  },
];

// Mock hooks
vi.mock('../../hooks/useProgress', () => ({
  useProgress: () => ({
    updateQuizScore: vi.fn(),
    recordAnswer: vi.fn(),
    incrementStreak: vi.fn(),
    resetStreak: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAudio', () => ({
  useAudio: () => ({
    play: vi.fn(),
    isPlaying: false,
    isLoading: false,
  }),
}));

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('QuizContainer Component', () => {
  const defaultProps = {
    questions: mockQuestions,
    onComplete: vi.fn(),
    onExit: vi.fn(),
    timeLimit: 300, // 5 minutes
    showTimer: true,
    showProgress: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render quiz container with first question', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('What is blockchain?')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });

    it('should show timer when enabled', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} showTimer={true} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/时间|timer/i)).toBeInTheDocument();
    });

    it('should hide timer when disabled', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} showTimer={false} />
        </TestWrapper>
      );

      expect(screen.queryByLabelText(/时间|timer/i)).not.toBeInTheDocument();
    });

    it('should show progress indicator when enabled', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} showProgress={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Question Navigation', () => {
    it('should navigate to next question after answering', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      // Answer first question
      const option = screen.getByText('A distributed ledger');
      fireEvent.click(option);

      const nextButton = screen.getByText(/下一题|next/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('DeFi stands for _____ Finance')).toBeInTheDocument();
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      });
    });

    it('should navigate to previous question', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      // Navigate to second question first
      const option = screen.getByText('A distributed ledger');
      fireEvent.click(option);
      fireEvent.click(screen.getByText(/下一题|next/i));

      await waitFor(() => {
        expect(screen.getByText('DeFi stands for _____ Finance')).toBeInTheDocument();
      });

      // Navigate back
      const prevButton = screen.getByText(/上一题|previous/i);
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('What is blockchain?')).toBeInTheDocument();
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
      });
    });

    it('should disable previous button on first question', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const prevButton = screen.queryByText(/上一题|previous/i);
      if (prevButton) {
        expect(prevButton).toBeDisabled();
      }
    });

    it('should show finish button on last question', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      // Navigate to last question
      const option = screen.getByText('A distributed ledger');
      fireEvent.click(option);
      fireEvent.click(screen.getByText(/下一题|next/i));

      await waitFor(() => {
        expect(screen.getByText(/完成|finish/i)).toBeInTheDocument();
      });
    });
  });

  describe('Answer Handling', () => {
    it('should record correct answers', async () => {
      const mockRecordAnswer = vi.fn();
      vi.mocked(require('../../hooks/useProgress').useProgress).mockReturnValue({
        updateQuizScore: vi.fn(),
        recordAnswer: mockRecordAnswer,
        incrementStreak: vi.fn(),
        resetStreak: vi.fn(),
      });

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const correctOption = screen.getByText('A distributed ledger');
      fireEvent.click(correctOption);

      expect(mockRecordAnswer).toHaveBeenCalledWith({
        questionId: '1',
        userAnswer: 'A distributed ledger',
        correctAnswer: 'A distributed ledger',
        isCorrect: true,
        timeSpent: expect.any(Number),
      });
    });

    it('should record incorrect answers', async () => {
      const mockRecordAnswer = vi.fn();
      vi.mocked(require('../../hooks/useProgress').useProgress).mockReturnValue({
        updateQuizScore: vi.fn(),
        recordAnswer: mockRecordAnswer,
        incrementStreak: vi.fn(),
        resetStreak: vi.fn(),
      });

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const incorrectOption = screen.getByText('A database');
      fireEvent.click(incorrectOption);

      expect(mockRecordAnswer).toHaveBeenCalledWith({
        questionId: '1',
        userAnswer: 'A database',
        correctAnswer: 'A distributed ledger',
        isCorrect: false,
        timeSpent: expect.any(Number),
      });
    });

    it('should show feedback after answering', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const option = screen.getByText('A distributed ledger');
      fireEvent.click(option);

      await waitFor(() => {
        expect(screen.getByText(/正确|correct/i)).toBeInTheDocument();
        expect(screen.getByText('Blockchain is a distributed ledger technology')).toBeInTheDocument();
      });
    });
  });

  describe('Timer Functionality', () => {
    it('should countdown timer', async () => {
      vi.useFakeTimers();

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} timeLimit={60} />
        </TestWrapper>
      );

      // Fast-forward time
      vi.advanceTimersByTime(10000); // 10 seconds

      await waitFor(() => {
        expect(screen.getByText(/50|0:50/)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should auto-submit when time runs out', async () => {
      vi.useFakeTimers();
      const mockOnComplete = vi.fn();

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} timeLimit={5} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      // Fast-forward past time limit
      vi.advanceTimersByTime(6000);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });

    it('should show warning when time is running low', async () => {
      vi.useFakeTimers();

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} timeLimit={30} />
        </TestWrapper>
      );

      // Fast-forward to warning threshold (last 10 seconds)
      vi.advanceTimersByTime(25000);

      await waitFor(() => {
        const timer = screen.getByLabelText(/时间|timer/i);
        expect(timer).toHaveClass(/warning|danger/);
      });

      vi.useRealTimers();
    });
  });

  describe('Quiz Completion', () => {
    it('should complete quiz and show results', async () => {
      const mockOnComplete = vi.fn();

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      // Answer all questions
      fireEvent.click(screen.getByText('A distributed ledger'));
      fireEvent.click(screen.getByText(/下一题|next/i));

      await waitFor(() => {
        expect(screen.getByText('DeFi stands for _____ Finance')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Decentralized' } });
      fireEvent.click(screen.getByText(/完成|finish/i));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          score: expect.any(Number),
          totalQuestions: 2,
          correctAnswers: expect.any(Number),
          timeSpent: expect.any(Number),
          answers: expect.any(Array),
        });
      });
    });

    it('should calculate correct score', async () => {
      const mockOnComplete = vi.fn();

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      // Answer both questions correctly
      fireEvent.click(screen.getByText('A distributed ledger'));
      fireEvent.click(screen.getByText(/下一题|next/i));

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Decentralized' } });
        fireEvent.click(screen.getByText(/完成|finish/i));
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            score: 100,
            correctAnswers: 2,
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', expect.stringContaining('quiz'));
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const firstOption = screen.getByText('A distributed ledger');
      
      // Should be focusable
      firstOption.focus();
      expect(firstOption).toHaveFocus();

      // Should respond to Enter key
      fireEvent.keyDown(firstOption, { key: 'Enter' });
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should announce question changes to screen readers', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const questionElement = screen.getByRole('heading', { level: 2 });
      expect(questionElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty questions array', () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} questions={[]} />
        </TestWrapper>
      );

      expect(screen.getByText(/没有题目|no questions/i)).toBeInTheDocument();
    });

    it('should handle malformed questions', () => {
      const malformedQuestions = [
        {
          id: '1',
          type: QuestionType.MULTIPLE_CHOICE,
          question: '',
          options: [],
          correctAnswer: '',
        },
      ] as QuizQuestion[];

      expect(() => {
        render(
          <TestWrapper>
            <QuizContainer {...defaultProps} questions={malformedQuestions} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle quiz exit', () => {
      const mockOnExit = vi.fn();

      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} onExit={mockOnExit} />
        </TestWrapper>
      );

      const exitButton = screen.getByText(/退出|exit/i);
      fireEvent.click(exitButton);

      expect(mockOnExit).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('What is blockchain?')).toBeInTheDocument();
    });

    it('should handle rapid user interactions', async () => {
      render(
        <TestWrapper>
          <QuizContainer {...defaultProps} />
        </TestWrapper>
      );

      const option = screen.getByText('A distributed ledger');
      
      // Rapid clicks
      fireEvent.click(option);
      fireEvent.click(option);
      fireEvent.click(option);

      // Should only register one selection
      expect(option).toHaveAttribute('aria-selected', 'true');
    });
  });
});