import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer } from 'react';
import { VocabularySortBy, SortDirection, } from '@/types';
export var VocabularyActionType;
(function (VocabularyActionType) {
    VocabularyActionType["SET_LOADING"] = "SET_LOADING";
    VocabularyActionType["SET_ERROR"] = "SET_ERROR";
    VocabularyActionType["SET_VOCABULARY"] = "SET_VOCABULARY";
    VocabularyActionType["ADD_VOCABULARY"] = "ADD_VOCABULARY";
    VocabularyActionType["UPDATE_VOCABULARY"] = "UPDATE_VOCABULARY";
    VocabularyActionType["DELETE_VOCABULARY"] = "DELETE_VOCABULARY";
    VocabularyActionType["SET_CURRENT_WORD"] = "SET_CURRENT_WORD";
    VocabularyActionType["SET_CURRENT_INDEX"] = "SET_CURRENT_INDEX";
    VocabularyActionType["NEXT_WORD"] = "NEXT_WORD";
    VocabularyActionType["PREVIOUS_WORD"] = "PREVIOUS_WORD";
    VocabularyActionType["TOGGLE_FAVORITE"] = "TOGGLE_FAVORITE";
    VocabularyActionType["SET_FAVORITES"] = "SET_FAVORITES";
    VocabularyActionType["SET_FILTER"] = "SET_FILTER";
    VocabularyActionType["SET_SORT"] = "SET_SORT";
    VocabularyActionType["SET_STATS"] = "SET_STATS";
    VocabularyActionType["RESET_STATE"] = "RESET_STATE";
    VocabularyActionType["INITIALIZE"] = "INITIALIZE";
})(VocabularyActionType || (VocabularyActionType = {}));
const initialState = {
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
const filterVocabulary = (vocabulary, filter, favorites) => {
    return vocabulary.filter(item => {
        if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            const matchesKeyword = item.word.toLowerCase().includes(keyword) ||
                item.definition.toLowerCase().includes(keyword) ||
                item.tags.some(tag => tag.toLowerCase().includes(keyword));
            if (!matchesKeyword)
                return false;
        }
        if (filter.categories && filter.categories.length > 0) {
            if (!filter.categories.includes(item.category))
                return false;
        }
        if (filter.difficulties && filter.difficulties.length > 0) {
            if (!filter.difficulties.includes(item.difficulty))
                return false;
        }
        if (filter.tags && filter.tags.length > 0) {
            const hasMatchingTag = filter.tags.some(tag => item.tags.includes(tag));
            if (!hasMatchingTag)
                return false;
        }
        if (filter.favoritesOnly) {
            if (!favorites.includes(item.id))
                return false;
        }
        if (filter.customOnly) {
            if (!item.isCustom)
                return false;
        }
        return true;
    });
};
const sortVocabulary = (vocabulary, sortBy, direction) => {
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
const calculateStats = (vocabulary) => {
    const total = vocabulary.length;
    const mastered = vocabulary.filter(item => item.accuracy >= 0.8).length;
    const learning = vocabulary.filter(item => item.accuracy > 0 && item.accuracy < 0.8).length;
    const notStarted = vocabulary.filter(item => item.accuracy === 0).length;
    const byCategory = vocabulary.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});
    const byDifficulty = vocabulary.reduce((acc, item) => {
        acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
        return acc;
    }, {});
    return {
        total,
        mastered,
        learning,
        notStarted,
        byCategory,
        byDifficulty,
    };
};
export const vocabularyReducer = (state, action) => {
    switch (action.type) {
        case VocabularyActionType.SET_LOADING:
            return { ...state, loading: action.payload };
        case VocabularyActionType.SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        case VocabularyActionType.SET_VOCABULARY: {
            const vocabulary = action.payload;
            const filteredVocabulary = sortVocabulary(filterVocabulary(vocabulary, state.filter, state.favorites), state.sortBy, state.sortDirection);
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
            const filteredVocabulary = sortVocabulary(filterVocabulary(newVocabulary, state.filter, state.favorites), state.sortBy, state.sortDirection);
            const stats = calculateStats(newVocabulary);
            return {
                ...state,
                vocabulary: newVocabulary,
                filteredVocabulary,
                stats,
            };
        }
        case VocabularyActionType.UPDATE_VOCABULARY: {
            const updatedVocabulary = state.vocabulary.map(item => item.id === action.payload.id ? action.payload : item);
            const filteredVocabulary = sortVocabulary(filterVocabulary(updatedVocabulary, state.filter, state.favorites), state.sortBy, state.sortDirection);
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
            const sortedAndFiltered = sortVocabulary(filterVocabulary(filteredVocabulary, state.filter, state.favorites), state.sortBy, state.sortDirection);
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
            const filteredVocabulary = sortVocabulary(filterVocabulary(state.vocabulary, state.filter, favorites), state.sortBy, state.sortDirection);
            return {
                ...state,
                favorites,
                filteredVocabulary,
            };
        }
        case VocabularyActionType.SET_FAVORITES: {
            const filteredVocabulary = sortVocabulary(filterVocabulary(state.vocabulary, state.filter, action.payload), state.sortBy, state.sortDirection);
            return {
                ...state,
                favorites: action.payload,
                filteredVocabulary,
            };
        }
        case VocabularyActionType.SET_FILTER: {
            const filteredVocabulary = sortVocabulary(filterVocabulary(state.vocabulary, action.payload, state.favorites), state.sortBy, state.sortDirection);
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
            const filteredVocabulary = sortVocabulary(filterVocabulary(state.vocabulary, state.filter, state.favorites), sortBy, direction);
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
export const VocabularyContext = createContext(undefined);
export const VocabularyProvider = ({ children }) => {
    const [state, dispatch] = useReducer(vocabularyReducer, initialState);
    return (_jsx(VocabularyContext.Provider, { value: { state, dispatch }, children: children }));
};
export const useVocabularyContext = () => {
    const context = useContext(VocabularyContext);
    if (context === undefined) {
        throw new Error('useVocabularyContext must be used within a VocabularyProvider');
    }
    return context;
};
