import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { VocabularyProvider, useVocabulary } from '../../contexts/VocabularyContext';
import { VocabularyItem, DifficultyLevel, Web3Category } from '../../types/vocabulary';

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

// Mock data
const mockVocabularyItems: VocabularyItem[] = [
  {
    id: '1',
    word: 'Blockchain',
    definition: 'A distributed ledger technology',
    pronunciation: '/ˈblɒktʃeɪn/',
    audioUrl: 'https://example.com/audio/blockchain.mp3',
    examples: ['Bitcoin uses blockchain technology'],
    category: Web3Category.BLOCKCHAIN,
    difficulty: DifficultyLevel.BEGINNER,
    tags: ['technology', 'crypto'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    word: 'DeFi',
    definition: 'Decentralized Finance',
    pronunciation: '/ˈdiːfaɪ/',
    audioUrl: 'https://example.com/audio/defi.mp3',
    examples: ['DeFi protocols enable lending without banks'],
    category: Web3Category.DEFI,
    difficulty: DifficultyLevel.INTERMEDIATE,
    tags: ['finance', 'defi'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

// Mock API service
vi.mock('../../services/vocabularyService', () => ({
  vocabularyService: {
    getAllVocabulary: vi.fn().mockResolvedValue(mockVocabularyItems),
    addVocabulary: vi.fn(),
    updateVocabulary: vi.fn(),
    deleteVocabulary: vi.fn(),
    generateWeb3Vocabulary: vi.fn().mockResolvedValue(mockVocabularyItems),
  },
}));

// Test wrapper
const createWrapper = (initialState?: any) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <VocabularyProvider initialState={initialState}>
      {children}
    </VocabularyProvider>
  );
  return Wrapper;
};

describe('VocabularyContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      expect(result.current.vocabulary).toEqual([]);
      expect(result.current.currentWord).toBeNull();
      expect(result.current.favorites).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load state from localStorage', () => {
      const savedState = {
        vocabulary: mockVocabularyItems,
        favorites: ['1'],
        currentWord: mockVocabularyItems[0],
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      expect(result.current.vocabulary).toEqual(mockVocabularyItems);
      expect(result.current.favorites).toEqual(['1']);
      expect(result.current.currentWord).toEqual(mockVocabularyItems[0]);
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      expect(result.current.vocabulary).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading Vocabulary', () => {
    it('should load vocabulary successfully', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      expect(result.current.vocabulary).toEqual(mockVocabularyItems);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      const mockError = new Error('Failed to load vocabulary');
      vi.mocked(require('../../services/vocabularyService').vocabularyService.getAllVocabulary)
        .mockRejectedValue(mockError);

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      expect(result.current.vocabulary).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });

    it('should set loading state during API call', async () => {
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(require('../../services/vocabularyService').vocabularyService.getAllVocabulary)
        .mockReturnValue(loadingPromise);

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.loadVocabulary();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!(mockVocabularyItems);
        await loadingPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Adding Vocabulary', () => {
    it('should add new vocabulary item', async () => {
      const newWord: VocabularyItem = {
        id: '3',
        word: 'NFT',
        definition: 'Non-Fungible Token',
        pronunciation: '/ˌenˌefˈtiː/',
        audioUrl: 'https://example.com/audio/nft.mp3',
        examples: ['NFTs represent unique digital assets'],
        category: Web3Category.NFT,
        difficulty: DifficultyLevel.BEGINNER,
        tags: ['token', 'digital'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(require('../../services/vocabularyService').vocabularyService.addVocabulary)
        .mockResolvedValue(newWord);

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      // Set initial vocabulary
      await act(async () => {
        await result.current.loadVocabulary();
      });

      await act(async () => {
        await result.current.addWord(newWord);
      });

      expect(result.current.vocabulary).toContain(newWord);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should handle add vocabulary errors', async () => {
      const mockError = new Error('Failed to add vocabulary');
      vi.mocked(require('../../services/vocabularyService').vocabularyService.addVocabulary)
        .mockRejectedValue(mockError);

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      const newWord = mockVocabularyItems[0];

      await act(async () => {
        await result.current.addWord(newWord);
      });

      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('Favorites Management', () => {
    it('should toggle favorite status', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      // Add to favorites
      act(() => {
        result.current.toggleFavorite('1');
      });

      expect(result.current.favorites).toContain('1');

      // Remove from favorites
      act(() => {
        result.current.toggleFavorite('1');
      });

      expect(result.current.favorites).not.toContain('1');
    });

    it('should persist favorites to localStorage', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.toggleFavorite('1');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vocabulary-state',
        expect.stringContaining('"favorites":["1"]')
      );
    });
  });

  describe('Current Word Management', () => {
    it('should set current word', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.setCurrentWord(mockVocabularyItems[0]);
      });

      expect(result.current.currentWord).toEqual(mockVocabularyItems[0]);
    });

    it('should navigate to next word', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.setCurrentWord(mockVocabularyItems[0]);
      });

      act(() => {
        result.current.nextWord();
      });

      expect(result.current.currentWord).toEqual(mockVocabularyItems[1]);
    });

    it('should navigate to previous word', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.setCurrentWord(mockVocabularyItems[1]);
      });

      act(() => {
        result.current.previousWord();
      });

      expect(result.current.currentWord).toEqual(mockVocabularyItems[0]);
    });

    it('should handle navigation at boundaries', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      // At first word, previous should stay at first
      act(() => {
        result.current.setCurrentWord(mockVocabularyItems[0]);
      });

      act(() => {
        result.current.previousWord();
      });

      expect(result.current.currentWord).toEqual(mockVocabularyItems[0]);

      // At last word, next should stay at last
      act(() => {
        result.current.setCurrentWord(mockVocabularyItems[mockVocabularyItems.length - 1]);
      });

      act(() => {
        result.current.nextWord();
      });

      expect(result.current.currentWord).toEqual(mockVocabularyItems[mockVocabularyItems.length - 1]);
    });
  });

  describe('Filtering and Search', () => {
    it('should filter vocabulary by category', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.setFilter({ category: Web3Category.BLOCKCHAIN });
      });

      const filteredVocabulary = result.current.filteredVocabulary;
      expect(filteredVocabulary).toHaveLength(1);
      expect(filteredVocabulary[0].category).toBe(Web3Category.BLOCKCHAIN);
    });

    it('should filter vocabulary by difficulty', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.setFilter({ difficulty: DifficultyLevel.BEGINNER });
      });

      const filteredVocabulary = result.current.filteredVocabulary;
      expect(filteredVocabulary).toHaveLength(1);
      expect(filteredVocabulary[0].difficulty).toBe(DifficultyLevel.BEGINNER);
    });

    it('should search vocabulary by text', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.searchVocabulary('blockchain');
      });

      const searchResults = result.current.searchResults;
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].word.toLowerCase()).toContain('blockchain');
    });

    it('should clear filters', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.setFilter({ category: Web3Category.BLOCKCHAIN });
      });

      act(() => {
        result.current.clearFilter();
      });

      expect(result.current.filteredVocabulary).toEqual(result.current.vocabulary);
    });
  });

  describe('Statistics', () => {
    it('should calculate vocabulary statistics', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.toggleFavorite('1');
      });

      const stats = result.current.stats;
      expect(stats.total).toBe(2);
      expect(stats.favorites).toBe(1);
      expect(stats.byCategory[Web3Category.BLOCKCHAIN]).toBe(1);
      expect(stats.byCategory[Web3Category.DEFI]).toBe(1);
      expect(stats.byDifficulty[DifficultyLevel.BEGINNER]).toBe(1);
      expect(stats.byDifficulty[DifficultyLevel.INTERMEDIATE]).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      // Simulate an error
      vi.mocked(require('../../services/vocabularyService').vocabularyService.getAllVocabulary)
        .mockRejectedValue(new Error('Test error'));

      await act(async () => {
        await result.current.loadVocabulary();
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should save state to localStorage on changes', async () => {
      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      act(() => {
        result.current.toggleFavorite('1');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vocabulary-state',
        expect.stringContaining('"favorites":["1"]')
      );
    });

    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.loadVocabulary();
      });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.toggleFavorite('1');
        });
      }).not.toThrow();
    });
  });

  describe('Context Provider', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useVocabulary());
      }).toThrow('useVocabulary must be used within a VocabularyProvider');
    });

    it('should accept initial state', () => {
      const initialState = {
        vocabulary: mockVocabularyItems,
        favorites: ['1'],
        currentWord: mockVocabularyItems[0],
      };

      const { result } = renderHook(() => useVocabulary(), {
        wrapper: createWrapper(initialState),
      });

      expect(result.current.vocabulary).toEqual(mockVocabularyItems);
      expect(result.current.favorites).toEqual(['1']);
      expect(result.current.currentWord).toEqual(mockVocabularyItems[0]);
    });
  });
});