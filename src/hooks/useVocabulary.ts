import { useCallback, useEffect } from 'react';
import {
  useVocabularyContext,
  VocabularyActionType,
} from '@/contexts/VocabularyContext';
import {
  VocabularyItem,
  VocabularyFilter,
  VocabularySortBy,
  SortDirection,
  Web3Category,
  DifficultyLevel,
} from '@/types';
import { storageService, StorageKey } from '@/services/storage';

/**
 * 词汇管理Hook
 */
export const useVocabulary = () => {
  const { state, dispatch } = useVocabularyContext();

  /**
   * 初始化词汇数据
   */
  const initializeVocabulary = useCallback(async () => {
    dispatch({ type: VocabularyActionType.SET_LOADING, payload: true });

    try {
      // 从本地存储加载词汇数据
      const savedVocabulary = storageService.getItem<VocabularyItem[]>(StorageKey.VOCABULARY_DATA);
      const savedFavorites = storageService.getItem<string[]>(StorageKey.VOCABULARY_FAVORITES);
      const savedFilter = storageService.getItem<VocabularyFilter>(StorageKey.VOCABULARY_FILTER);
      const savedSort = storageService.getItem<{ sortBy: VocabularySortBy; direction: SortDirection }>(StorageKey.VOCABULARY_SORT);

      // 设置词汇数据
      if (savedVocabulary && savedVocabulary.length > 0) {
        dispatch({ type: VocabularyActionType.SET_VOCABULARY, payload: savedVocabulary });
      } else {
        // 如果没有本地数据，设置空数组
        dispatch({ type: VocabularyActionType.SET_VOCABULARY, payload: [] });
      }

      // 设置收藏列表
      if (savedFavorites) {
        dispatch({ type: VocabularyActionType.SET_FAVORITES, payload: savedFavorites });
      }

      // 设置过滤条件
      if (savedFilter) {
        dispatch({ type: VocabularyActionType.SET_FILTER, payload: savedFilter });
      }

      // 设置排序方式
      if (savedSort) {
        dispatch({ type: VocabularyActionType.SET_SORT, payload: savedSort });
      }

      dispatch({ type: VocabularyActionType.INITIALIZE });
    } catch (error) {
      console.error('Failed to initialize vocabulary:', error);
      dispatch({ type: VocabularyActionType.SET_ERROR, payload: '初始化词汇数据失败' });
    }
  }, [dispatch]);

  /**
   * 保存词汇数据到本地存储
   */
  const saveVocabularyData = useCallback(() => {
    try {
      storageService.setItem(StorageKey.VOCABULARY_DATA, state.vocabulary);
      storageService.setItem(StorageKey.VOCABULARY_FAVORITES, state.favorites);
      storageService.setItem(StorageKey.VOCABULARY_FILTER, state.filter);
      storageService.setItem(StorageKey.VOCABULARY_SORT, {
        sortBy: state.sortBy,
        direction: state.sortDirection,
      });
    } catch (error) {
      console.error('Failed to save vocabulary data:', error);
    }
  }, [state.vocabulary, state.favorites, state.filter, state.sortBy, state.sortDirection]);

  /**
   * 添加词汇
   */
  const addVocabulary = useCallback((vocabulary: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVocabulary: VocabularyItem = {
      ...vocabulary,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      studyCount: 0,
      accuracy: 0,
    };

    dispatch({ type: VocabularyActionType.ADD_VOCABULARY, payload: newVocabulary });
    return newVocabulary;
  }, [dispatch]);

  /**
   * 更新词汇
   */
  const updateVocabulary = useCallback((vocabulary: VocabularyItem) => {
    const updatedVocabulary = {
      ...vocabulary,
      updatedAt: new Date(),
    };

    dispatch({ type: VocabularyActionType.UPDATE_VOCABULARY, payload: updatedVocabulary });
  }, [dispatch]);

  /**
   * 删除词汇
   */
  const deleteVocabulary = useCallback((vocabularyId: string) => {
    dispatch({ type: VocabularyActionType.DELETE_VOCABULARY, payload: vocabularyId });
  }, [dispatch]);

  /**
   * 设置当前词汇
   */
  const setCurrentWord = useCallback((word: VocabularyItem | null) => {
    dispatch({ type: VocabularyActionType.SET_CURRENT_WORD, payload: word });
  }, [dispatch]);

  /**
   * 设置当前词汇索引
   */
  const setCurrentIndex = useCallback((index: number) => {
    dispatch({ type: VocabularyActionType.SET_CURRENT_INDEX, payload: index });
  }, [dispatch]);

  /**
   * 下一个词汇
   */
  const nextWord = useCallback(() => {
    dispatch({ type: VocabularyActionType.NEXT_WORD });
  }, [dispatch]);

  /**
   * 上一个词汇
   */
  const previousWord = useCallback(() => {
    dispatch({ type: VocabularyActionType.PREVIOUS_WORD });
  }, [dispatch]);

  /**
   * 切换收藏状态
   */
  const toggleFavorite = useCallback((vocabularyId: string) => {
    dispatch({ type: VocabularyActionType.TOGGLE_FAVORITE, payload: vocabularyId });
  }, [dispatch]);

  /**
   * 设置过滤条件
   */
  const setFilter = useCallback((filter: VocabularyFilter) => {
    dispatch({ type: VocabularyActionType.SET_FILTER, payload: filter });
  }, [dispatch]);

  /**
   * 清除过滤条件
   */
  const clearFilter = useCallback(() => {
    dispatch({ type: VocabularyActionType.SET_FILTER, payload: {} });
  }, [dispatch]);

  /**
   * 设置排序方式
   */
  const setSort = useCallback((sortBy: VocabularySortBy, direction: SortDirection) => {
    dispatch({ type: VocabularyActionType.SET_SORT, payload: { sortBy, direction } });
  }, [dispatch]);

  /**
   * 搜索词汇
   */
  const searchVocabulary = useCallback((keyword: string) => {
    setFilter({ ...state.filter, keyword });
  }, [state.filter, setFilter]);

  /**
   * 按分类过滤
   */
  const filterByCategory = useCallback((categories: Web3Category[]) => {
    setFilter({ ...state.filter, categories });
  }, [state.filter, setFilter]);

  /**
   * 按难度过滤
   */
  const filterByDifficulty = useCallback((difficulties: DifficultyLevel[]) => {
    setFilter({ ...state.filter, difficulties });
  }, [state.filter, setFilter]);

  /**
   * 只显示收藏
   */
  const showFavoritesOnly = useCallback((favoritesOnly: boolean) => {
    setFilter({ ...state.filter, favoritesOnly });
  }, [state.filter, setFilter]);

  /**
   * 只显示自定义词汇
   */
  const showCustomOnly = useCallback((customOnly: boolean) => {
    setFilter({ ...state.filter, customOnly });
  }, [state.filter, setFilter]);

  /**
   * 批量添加词汇
   */
  const addMultipleVocabulary = useCallback((vocabularyList: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newVocabularyList = vocabularyList.map(vocab => ({
      ...vocab,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      studyCount: 0,
      accuracy: 0,
    }));

    // 逐个添加以触发状态更新
    newVocabularyList.forEach(vocab => {
      dispatch({ type: VocabularyActionType.ADD_VOCABULARY, payload: vocab });
    });

    return newVocabularyList;
  }, [dispatch]);

  /**
   * 重置词汇状态
   */
  const resetVocabulary = useCallback(() => {
    dispatch({ type: VocabularyActionType.RESET_STATE });
  }, [dispatch]);

  /**
   * 获取词汇统计信息
   */
  const getVocabularyStats = useCallback(() => {
    return state.stats;
  }, [state.stats]);

  /**
   * 检查词汇是否为收藏
   */
  const isFavorite = useCallback((vocabularyId: string) => {
    return state.favorites.includes(vocabularyId);
  }, [state.favorites]);

  /**
   * 获取收藏词汇列表
   */
  const getFavoriteVocabulary = useCallback(() => {
    return state.vocabulary.filter(vocab => state.favorites.includes(vocab.id));
  }, [state.vocabulary, state.favorites]);

  /**
   * 获取自定义词汇列表
   */
  const getCustomVocabulary = useCallback(() => {
    return state.vocabulary.filter(vocab => vocab.isCustom);
  }, [state.vocabulary]);

  // 自动保存数据
  useEffect(() => {
    if (state.initialized) {
      saveVocabularyData();
    }
  }, [state.vocabulary, state.favorites, state.filter, state.sortBy, state.sortDirection, state.initialized, saveVocabularyData]);

  return {
    // 状态
    vocabulary: state.vocabulary,
    filteredVocabulary: state.filteredVocabulary,
    currentWord: state.currentWord,
    currentIndex: state.currentIndex,
    favorites: state.favorites,
    filter: state.filter,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // 操作方法
    initializeVocabulary,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    setCurrentWord,
    setCurrentIndex,
    nextWord,
    previousWord,
    toggleFavorite,
    setFilter,
    clearFilter,
    setSort,
    searchVocabulary,
    filterByCategory,
    filterByDifficulty,
    showFavoritesOnly,
    showCustomOnly,
    addMultipleVocabulary,
    resetVocabulary,

    // 工具方法
    getVocabularyStats,
    isFavorite,
    getFavoriteVocabulary,
    getCustomVocabulary,
  };
};