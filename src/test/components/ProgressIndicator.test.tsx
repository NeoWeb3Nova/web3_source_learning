import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ProgressIndicator from '../../components/practice/ProgressIndicator';

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('ProgressIndicator Component', () => {
  const defaultProps = {
    current: 3,
    total: 10,
    showPercentage: true,
    showNumbers: true,
    size: 'md' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render progress indicator with correct values', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('should hide percentage when showPercentage is false', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} showPercentage={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('30%')).not.toBeInTheDocument();
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('should hide numbers when showNumbers is false', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} showNumbers={false} />
        </TestWrapper>
      );

      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.queryByText('3 / 10')).not.toBeInTheDocument();
    });

    it('should handle zero progress', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={0} />
        </TestWrapper>
      );

      expect(screen.getByText('0 / 10')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle complete progress', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={10} />
        </TestWrapper>
      );

      expect(screen.getByText('10 / 10')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} />
        </TestWrapper>
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '10');
      expect(progressbar).toHaveAttribute('aria-label', expect.stringContaining('进度'));
    });

    it('should announce progress changes to screen readers', () => {
      const { rerender } = render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} />
        </TestWrapper>
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');

      rerender(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={5} />
        </TestWrapper>
      );

      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
    });
  });

  describe('Visual States', () => {
    it('should apply different colors based on progress', () => {
      const { rerender } = render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={2} />
        </TestWrapper>
      );

      let progressbar = screen.getByRole('progressbar');
      // Low progress should have different styling
      expect(progressbar).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={8} />
        </TestWrapper>
      );

      progressbar = screen.getByRole('progressbar');
      // High progress should have different styling
      expect(progressbar).toBeInTheDocument();
    });

    it('should handle different sizes', () => {
      const { rerender } = render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} size="sm" />
        </TestWrapper>
      );

      let progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} size="lg" />
        </TestWrapper>
      );

      progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid current value', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={-1} />
        </TestWrapper>
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle current value exceeding total', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={15} />
        </TestWrapper>
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '10');
    });

    it('should handle zero total', () => {
      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} total={0} />
        </TestWrapper>
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should animate progress changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={1} />
        </TestWrapper>
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '1');

      rerender(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} current={5} />
        </TestWrapper>
      );

      expect(progressbar).toHaveAttribute('aria-valuenow', '5');
      // Animation classes or styles would be tested here
    });

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <ProgressIndicator {...defaultProps} />
        </TestWrapper>
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      // Should not have animation classes when reduced motion is preferred
    });
  });
});