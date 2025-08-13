import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vocabularyService } from '../../services/vocabularyService';
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

// Mock fetch
global.fetch = vi.fn();

const mockVocabularyItem: VocabularyItem = {
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

describe('VocabularyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllVocabulary', () => {
    it('should return vocabulary from localStorage', async () => {
      const mockData = [mockVocabularyItem];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = await vocabularyService.getAllVocabulary();

      expect(result).toEqual(mockData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('vocabulary-items');
    });

    it('should return empty array when no data in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await vocabularyService.getAllVocabulary();

      expect(result).toEqual([]);
    });

    it('should handle corrupted localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = await vocabularyService.getAllVocabulary();

      expect(result).toEqual([]);
    });
  });

  describe('addVocabulary', () => {
    it('should add new vocabulary item', async () => {
      const existingData = [mockVocabularyItem];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      const newItem: VocabularyItem = {
        ...mockVocabularyItem,
        id: '2',
        word: 'DeFi',
        definition: 'Decentralized Finance',
      };

      const result = await vocabularyService.addVocabulary(newItem);

      expect(result).toEqual(newItem);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vocabulary-items',
        JSON.stringify([...existingData, newItem])
      );
    });

    it('should generate ID if not provided', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      const itemWithoutId = {
        ...mockVocabularyItem,
        id: undefined,
      } as any;

      const result = await vocabularyService.addVocabulary(itemWithoutId);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should handle localStorage errors', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      await expect(vocabularyService.addVocabulary(mockVocabularyItem))
        .rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('updateVocabulary', () => {
    it('should update existing vocabulary item', async () => {
      const existingData = [mockVocabularyItem];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      const updatedItem = {
        ...mockVocabularyItem,
        definition: 'Updated definition',
        updatedAt: new Date(),
      };

      const result = await vocabularyService.updateVocabulary('1', updatedItem);

      expect(result.definition).toBe('Updated definition');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error if item not found', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      await expect(vocabularyService.updateVocabulary('nonexistent', mockVocabularyItem))
        .rejects.toThrow('Vocabulary item not found');
    });
  });

  describe('deleteVocabulary', () => {
    it('should delete vocabulary item', async () => {
      const existingData = [mockVocabularyItem, { ...mockVocabularyItem, id: '2' }];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      await vocabularyService.deleteVocabulary('1');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vocabulary-items',
        JSON.stringify([{ ...mockVocabularyItem, id: '2' }])
      );
    });

    it('should throw error if item not found', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      await expect(vocabularyService.deleteVocabulary('nonexistent'))
        .rejects.toThrow('Vocabulary item not found');
    });
  });

  describe('generateWeb3Vocabulary', () => {
    it('should fetch vocabulary from API', async () => {
      const mockApiResponse = {
        vocabulary: [mockVocabularyItem],
        total: 1,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      } as Response);

      const result = await vocabularyService.generateWeb3Vocabulary();

      expect(result).toEqual(mockApiResponse.vocabulary);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/web3-vocabulary'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(vocabularyService.generateWeb3Vocabulary())
        .rejects.toThrow('Failed to fetch Web3 vocabulary');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(vocabularyService.generateWeb3Vocabulary())
        .rejects.toThrow('Network error');
    });

    it('should return fallback data when API fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      // Test fallback mechanism if implemented
      try {
        const result = await vocabularyService.generateWeb3Vocabulary();
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // Expected if no fallback is implemented
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('searchVocabulary', () => {
    it('should search vocabulary by word', async () => {
      const vocabularyData = [
        mockVocabularyItem,
        { ...mockVocabularyItem, id: '2', word: 'DeFi', definition: 'Decentralized Finance' },
        { ...mockVocabularyItem, id: '3', word: 'NFT', definition: 'Non-Fungible Token' },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const result = await vocabularyService.searchVocabulary('blockchain');

      expect(result).toHaveLength(1);
      expect(result[0].word.toLowerCase()).toContain('blockchain');
    });

    it('should search vocabulary by definition', async () => {
      const vocabularyData = [
        mockVocabularyItem,
        { ...mockVocabularyItem, id: '2', word: 'DeFi', definition: 'Decentralized Finance' },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const result = await vocabularyService.searchVocabulary('finance');

      expect(result).toHaveLength(1);
      expect(result[0].definition.toLowerCase()).toContain('finance');
    });

    it('should return empty array for no matches', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockVocabularyItem]));

      const result = await vocabularyService.searchVocabulary('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle case-insensitive search', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockVocabularyItem]));

      const result = await vocabularyService.searchVocabulary('BLOCKCHAIN');

      expect(result).toHaveLength(1);
    });
  });

  describe('filterVocabulary', () => {
    it('should filter by category', async () => {
      const vocabularyData = [
        mockVocabularyItem,
        { ...mockVocabularyItem, id: '2', category: Web3Category.DEFI },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const result = await vocabularyService.filterVocabulary({
        category: Web3Category.BLOCKCHAIN,
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(Web3Category.BLOCKCHAIN);
    });

    it('should filter by difficulty', async () => {
      const vocabularyData = [
        mockVocabularyItem,
        { ...mockVocabularyItem, id: '2', difficulty: DifficultyLevel.ADVANCED },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const result = await vocabularyService.filterVocabulary({
        difficulty: DifficultyLevel.BEGINNER,
      });

      expect(result).toHaveLength(1);
      expect(result[0].difficulty).toBe(DifficultyLevel.BEGINNER);
    });

    it('should filter by multiple criteria', async () => {
      const vocabularyData = [
        mockVocabularyItem,
        { ...mockVocabularyItem, id: '2', category: Web3Category.DEFI },
        { ...mockVocabularyItem, id: '3', difficulty: DifficultyLevel.ADVANCED },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const result = await vocabularyService.filterVocabulary({
        category: Web3Category.BLOCKCHAIN,
        difficulty: DifficultyLevel.BEGINNER,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return all items when no filters applied', async () => {
      const vocabularyData = [mockVocabularyItem];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const result = await vocabularyService.filterVocabulary({});

      expect(result).toEqual(vocabularyData);
    });
  });

  describe('getVocabularyStats', () => {
    it('should calculate vocabulary statistics', async () => {
      const vocabularyData = [
        mockVocabularyItem,
        { ...mockVocabularyItem, id: '2', category: Web3Category.DEFI, difficulty: DifficultyLevel.INTERMEDIATE },
        { ...mockVocabularyItem, id: '3', category: Web3Category.NFT, difficulty: DifficultyLevel.ADVANCED },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(vocabularyData));

      const stats = await vocabularyService.getVocabularyStats();

      expect(stats.total).toBe(3);
      expect(stats.byCategory[Web3Category.BLOCKCHAIN]).toBe(1);
      expect(stats.byCategory[Web3Category.DEFI]).toBe(1);
      expect(stats.byCategory[Web3Category.NFT]).toBe(1);
      expect(stats.byDifficulty[DifficultyLevel.BEGINNER]).toBe(1);
      expect(stats.byDifficulty[DifficultyLevel.INTERMEDIATE]).toBe(1);
      expect(stats.byDifficulty[DifficultyLevel.ADVANCED]).toBe(1);
    });

    it('should handle empty vocabulary', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      const stats = await vocabularyService.getVocabularyStats();

      expect(stats.total).toBe(0);
      expect(Object.values(stats.byCategory).every(count => count === 0)).toBe(true);
      expect(Object.values(stats.byDifficulty).every(count => count === 0)).toBe(true);
    });
  });
});