import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  VocabularyItem,
  VocabularyStats,
  VocabularyFilter,
  VocabularySortBy,
  SortDirection,
  Web3Category,
  DifficultyLevel,
} from '@/types';

/**
 * 词汇状态接口
 */
export interface VocabularyState {
  /** 词汇列表 */
  vocabulary: VocabularyItem[];
  /** 当前选中的词汇 */
  currentWord: VocabularyItem | null;
  /** 当前词汇索引 */
  currentIndex: number;
  /** 收藏的词汇ID列表 */
  favorites: string[];
  /** 过滤后的词汇列表 */
  filteredVocabulary: VocabularyItem[];
  /** 当前过滤条件 */
  filter: VocabularyFilter;
  /** 排序方式 */
  sortBy: VocabularySortBy;
  /** 排序方向 */
  sortDirection: SortDirection;
  /** 词汇统计 */
  stats: VocabularyStats | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 词汇动作类型枚举
 */
export enum VocabularyActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_VOCABULARY = 'SET_VOCABULARY',
  ADD_VOCABULARY = 'ADD_VOCABULARY',
  UPDATE_VOCABULARY = 'UPDATE_VOCABULARY',
  DELETE_VOCABULARY = 'DELETE_VOCABULARY',
  SET_CURRENT_WORD = 'SET_CURRENT_WORD',
  SET_CURRENT_INDEX = 'SET_CURRENT_INDEX',
  NEXT_WORD = 'NEXT_WORD',
  PREVIOUS_WORD = 'PREVIOUS_WORD',
  TOGGLE_FAVORITE = 'TOGGLE_FAVORITE',
  SET_FAVORITES = 'SET_FAVORITES',
  SET_FILTER = 'SET_FILTER',
  SET_SORT = 'SET_SORT',
  SET_STATS = 'SET_STATS',
  RESET_STATE = 'RESET_STATE',
  INITIALIZE = 'INITIALIZE',
}

/**
 * 词汇动作接口
 */
export type VocabularyAction =
  | { type: VocabularyActionType.SET_LOADING; payload: boolean }
  | { type: VocabularyActionType.SET_ERROR; payload: string | null }
  | { type: VocabularyActionType.SET_VOCABULARY; payload: VocabularyItem[] }
  | { type: VocabularyActionType.ADD_VOCABULARY; payload: VocabularyItem }
  | { type: VocabularyActionType.UPDATE_VOCABULARY; payload: VocabularyItem }
  | { type: VocabularyActionType.DELETE_VOCABULARY; payload: string }
  | { type: VocabularyActionType.SET_CURRENT_WORD; payload: VocabularyItem | null }
  | { type: VocabularyActionType.SET_CURRENT_INDEX; payload: number }
  | { type: VocabularyActionType.NEXT_WORD }
  | { type: VocabularyActionType.PREVIOUS_WORD }
  | { type: VocabularyActionType.TOGGLE_FAVORITE; payload: string }
  | { type: VocabularyActionType.SET_FAVORITES; payload: string[] }
  | { type: VocabularyActionType.SET_FILTER; payload: VocabularyFilter }
  | { type: VocabularyActionType.SET_SORT; payload: { sortBy: VocabularySortBy; direction: SortDirection } }
  | { type: VocabularyActionType.SET_STATS; payload: VocabularyStats }
  | { type: VocabularyActionType.RESET_STATE }
  | { type: VocabularyActionType.INITIALIZE };

/**
 * 初始状态
 */
const initialState: VocabularyState = {
  vocabulary: [],
  currentWord: null,
  currentIndex: 0,
  favorites: [],
  filteredVocabulary: [],
  filter: {},
  sortBy: VocabularySortBy.CREATED_AT,
  sortDirection: SortDirection.DESC,
  stats: null,
  loading: false,
  error: null,
  initialized: false,
};

/**
 * 过滤词汇列表
 */
const filterVocabulary = (vocabulary: VocabularyItem[], filter: VocabularyFilter, favorites: string[]): VocabularyItem[] => {
  return vocabulary.filter(item => {
    // 关键词过滤
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      const matchesKeyword = 
        item.word.toLowerCase().includes(keyword) ||
        item.definition.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword));
      if (!matchesKeyword) return false;
    }

    // 分类过滤
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(item.category)) return false;
    }

    // 难度过滤
    if (filter.difficulties && filter.difficulties.length > 0) {
      if (!filter.difficulties.includes(item.difficulty)) return false;
    }

    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some(tag => item.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // 收藏过滤
    if (filter.favoritesOnly) {
      if (!favorites.includes(item.id)) return false;
    }

    // 自定义词汇过滤
    if (filter.customOnly) {
      if (!item.isCustom) return false;
    }

    return true;
  });
};

/**
 * 排序词汇列表
 */
const sortVocabulary = (vocabulary: VocabularyItem[], sortBy: VocabularySortBy, direction: SortDirection): VocabularyItem[] => {
  const sorted = [...vocabulary].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case VocabularySortBy.WORD:
        comparison = a.word.localeCompare(b.word);
        break;
      case VocabularySortBy.DIFFICULTY:
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
      case VocabularySortBy.ACCURACY:
        comparison = a.accuracy - b.accuracy;
        break;
      case VocabularySortBy.STUDY_COUNT:
        comparison = a.studyCount - b.studyCount;
        break;
      case VocabularySortBy.CREATED_AT:
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return direction === SortDirection.ASC ? comparison : -comparison;
  });

  return sorted;
};

/**
 * 计算词汇统计
 */
const calculateStats = (vocabulary: VocabularyItem[]): VocabularyStats => {
  const total = vocabulary.length;
  const mastered = vocabulary.filter(item => item.accuracy >= 0.8).length;
  const learning = vocabulary.filter(item => item.accuracy > 0 && item.accuracy < 0.8).length;
  const notStarted = vocabulary.filter(item => item.accuracy === 0).length;

  const byCategory = vocabulary.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<Web3Category, number>);

  const byDifficulty = vocabulary.reduce((acc, item) => {
    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<DifficultyLevel, number>);

  return {
    total,
    mastered,
    learning,
    notStarted,
    byCategory,
    byDifficulty,
  };
};

/**
 * 词汇状态reducer
 */
export const vocabularyReducer = (state: VocabularyState, action: VocabularyAction): VocabularyState => {
  switch (action.type) {
    case VocabularyActionType.SET_LOADING:
      return { ...state, loading: action.payload };

    case VocabularyActionType.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case VocabularyActionType.SET_VOCABULARY: {
      const vocabulary = action.payload;
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(vocabulary, state.filter, state.favorites),
        state.sortBy,
        state.sortDirection
      );
      const stats = calculateStats(vocabulary);
      
      return {
        ...state,
        vocabulary,
        filteredVocabulary,
        stats,
        currentWord: filteredVocabulary[0] || null,
        currentIndex: 0,
        loading: false,
        error: null,
      };
    }

    case VocabularyActionType.ADD_VOCABULARY: {
      const newVocabulary = [...state.vocabulary, action.payload];
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(newVocabulary, state.filter, state.favorites),
        state.sortBy,
        state.sortDirection
      );
      const stats = calculateStats(newVocabulary);

      return {
        ...state,
        vocabulary: newVocabulary,
        filteredVocabulary,
        stats,
      };
    }

    case VocabularyActionType.UPDATE_VOCABULARY: {
      const updatedVocabulary = state.vocabulary.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(updatedVocabulary, state.filter, state.favorites),
        state.sortBy,
        state.sortDirection
      );
      const stats = calculateStats(updatedVocabulary);

      return {
        ...state,
        vocabulary: updatedVocabulary,
        filteredVocabulary,
        stats,
        currentWord: state.currentWord?.id === action.payload.id ? action.payload : state.currentWord,
      };
    }

    case VocabularyActionType.DELETE_VOCABULARY: {
      const filteredVocabulary = state.vocabulary.filter(item => item.id !== action.payload);
      const sortedAndFiltered = sortVocabulary(
        filterVocabulary(filteredVocabulary, state.filter, state.favorites),
        state.sortBy,
        state.sortDirection
      );
      const stats = calculateStats(filteredVocabulary);

      return {
        ...state,
        vocabulary: filteredVocabulary,
        filteredVocabulary: sortedAndFiltered,
        stats,
        currentWord: sortedAndFiltered[Math.min(state.currentIndex, sortedAndFiltered.length - 1)] || null,
        currentIndex: Math.min(state.currentIndex, Math.max(0, sortedAndFiltered.length - 1)),
      };
    }

    case VocabularyActionType.SET_CURRENT_WORD:
      return { ...state, currentWord: action.payload };

    case VocabularyActionType.SET_CURRENT_INDEX: {
      const index = Math.max(0, Math.min(action.payload, state.filteredVocabulary.length - 1));
      return {
        ...state,
        currentIndex: index,
        currentWord: state.filteredVocabulary[index] || null,
      };
    }

    case VocabularyActionType.NEXT_WORD: {
      const nextIndex = (state.currentIndex + 1) % state.filteredVocabulary.length;
      return {
        ...state,
        currentIndex: nextIndex,
        currentWord: state.filteredVocabulary[nextIndex] || null,
      };
    }

    case VocabularyActionType.PREVIOUS_WORD: {
      const prevIndex = state.currentIndex === 0 
        ? state.filteredVocabulary.length - 1 
        : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentWord: state.filteredVocabulary[prevIndex] || null,
      };
    }

    case VocabularyActionType.TOGGLE_FAVORITE: {
      const wordId = action.payload;
      const favorites = state.favorites.includes(wordId)
        ? state.favorites.filter(id => id !== wordId)
        : [...state.favorites, wordId];
      
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(state.vocabulary, state.filter, favorites),
        state.sortBy,
        state.sortDirection
      );

      return {
        ...state,
        favorites,
        filteredVocabulary,
      };
    }

    case VocabularyActionType.SET_FAVORITES: {
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(state.vocabulary, state.filter, action.payload),
        state.sortBy,
        state.sortDirection
      );

      return {
        ...state,
        favorites: action.payload,
        filteredVocabulary,
      };
    }

    case VocabularyActionType.SET_FILTER: {
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(state.vocabulary, action.payload, state.favorites),
        state.sortBy,
        state.sortDirection
      );

      return {
        ...state,
        filter: action.payload,
        filteredVocabulary,
        currentIndex: 0,
        currentWord: filteredVocabulary[0] || null,
      };
    }

    case VocabularyActionType.SET_SORT: {
      const { sortBy, direction } = action.payload;
      const filteredVocabulary = sortVocabulary(
        filterVocabulary(state.vocabulary, state.filter, state.favorites),
        sortBy,
        direction
      );

      return {
        ...state,
        sortBy,
        sortDirection: direction,
        filteredVocabulary,
        currentIndex: 0,
        currentWord: filteredVocabulary[0] || null,
      };
    }

    case VocabularyActionType.SET_STATS:
      return { ...state, stats: action.payload };

    case VocabularyActionType.INITIALIZE:
      return { ...state, initialized: true };

    case VocabularyActionType.RESET_STATE:
      return { ...initialState };

    default:
      return state;
  }
};

/**
 * 词汇上下文接口
 */
export interface VocabularyContextType {
  state: VocabularyState;
  dispatch: React.Dispatch<VocabularyAction>;
}

/**
 * 词汇上下文
 */
export const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

/**
 * 词汇提供者组件Props
 */
interface VocabularyProviderProps {
  children: ReactNode;
}

/**
 * 词汇提供者组件
 */
export const VocabularyProvider: React.FC<VocabularyProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(vocabularyReducer, initialState);

  return (
    <VocabularyContext.Provider value={{ state, dispatch }}>
      {children}
    </VocabularyContext.Provider>
  );
};

/**
 * 使用词汇上下文的Hook
 */
export const useVocabularyContext = (): VocabularyContextType => {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabularyContext must be used within a VocabularyProvider');
  }
  return context;
};