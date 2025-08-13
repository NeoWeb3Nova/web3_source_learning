import { useCallback, useEffect } from 'react';
import { useVocabularyContext, VocabularyActionType, } from '@/contexts/VocabularyContext';
import { storageService, StorageKey } from '@/services/storage';
export const useVocabulary = () => {
    const { state, dispatch } = useVocabularyContext();
    const initializeVocabulary = useCallback(async () => {
        dispatch({ type: VocabularyActionType.SET_LOADING, payload: true });
        try {
            const savedVocabulary = storageService.getItem(StorageKey.VOCABULARY_DATA);
            const savedFavorites = storageService.getItem(StorageKey.VOCABULARY_FAVORITES);
            const savedFilter = storageService.getItem(StorageKey.VOCABULARY_FILTER);
            const savedSort = storageService.getItem(StorageKey.VOCABULARY_SORT);
            if (savedVocabulary && savedVocabulary.length > 0) {
                dispatch({ type: VocabularyActionType.SET_VOCABULARY, payload: savedVocabulary });
            }
            else {
                dispatch({ type: VocabularyActionType.SET_VOCABULARY, payload: [] });
            }
            if (savedFavorites) {
                dispatch({ type: VocabularyActionType.SET_FAVORITES, payload: savedFavorites });
            }
            if (savedFilter) {
                dispatch({ type: VocabularyActionType.SET_FILTER, payload: savedFilter });
            }
            if (savedSort) {
                dispatch({ type: VocabularyActionType.SET_SORT, payload: savedSort });
            }
            dispatch({ type: VocabularyActionType.INITIALIZE });
        }
        catch (error) {
            console.error('Failed to initialize vocabulary:', error);
            dispatch({ type: VocabularyActionType.SET_ERROR, payload: '初始化词汇数据失败' });
        }
    }, [dispatch]);
    const saveVocabularyData = useCallback(() => {
        try {
            storageService.setItem(StorageKey.VOCABULARY_DATA, state.vocabulary);
            storageService.setItem(StorageKey.VOCABULARY_FAVORITES, state.favorites);
            storageService.setItem(StorageKey.VOCABULARY_FILTER, state.filter);
            storageService.setItem(StorageKey.VOCABULARY_SORT, {
                sortBy: state.sortBy,
                direction: state.sortDirection,
            });
        }
        catch (error) {
            console.error('Failed to save vocabulary data:', error);
        }
    }, [state.vocabulary, state.favorites, state.filter, state.sortBy, state.sortDirection]);
    const addVocabulary = useCallback((vocabulary) => {
        const newVocabulary = {
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
    const updateVocabulary = useCallback((vocabulary) => {
        const updatedVocabulary = {
            ...vocabulary,
            updatedAt: new Date(),
        };
        dispatch({ type: VocabularyActionType.UPDATE_VOCABULARY, payload: updatedVocabulary });
    }, [dispatch]);
    const deleteVocabulary = useCallback((vocabularyId) => {
        dispatch({ type: VocabularyActionType.DELETE_VOCABULARY, payload: vocabularyId });
    }, [dispatch]);
    const setCurrentWord = useCallback((word) => {
        dispatch({ type: VocabularyActionType.SET_CURRENT_WORD, payload: word });
    }, [dispatch]);
    const setCurrentIndex = useCallback((index) => {
        dispatch({ type: VocabularyActionType.SET_CURRENT_INDEX, payload: index });
    }, [dispatch]);
    const nextWord = useCallback(() => {
        dispatch({ type: VocabularyActionType.NEXT_WORD });
    }, [dispatch]);
    const previousWord = useCallback(() => {
        dispatch({ type: VocabularyActionType.PREVIOUS_WORD });
    }, [dispatch]);
    const toggleFavorite = useCallback((vocabularyId) => {
        dispatch({ type: VocabularyActionType.TOGGLE_FAVORITE, payload: vocabularyId });
    }, [dispatch]);
    const setFilter = useCallback((filter) => {
        dispatch({ type: VocabularyActionType.SET_FILTER, payload: filter });
    }, [dispatch]);
    const clearFilter = useCallback(() => {
        dispatch({ type: VocabularyActionType.SET_FILTER, payload: {} });
    }, [dispatch]);
    const setSort = useCallback((sortBy, direction) => {
        dispatch({ type: VocabularyActionType.SET_SORT, payload: { sortBy, direction } });
    }, [dispatch]);
    const searchVocabulary = useCallback((keyword) => {
        setFilter({ ...state.filter, keyword });
    }, [state.filter, setFilter]);
    const filterByCategory = useCallback((categories) => {
        setFilter({ ...state.filter, categories });
    }, [state.filter, setFilter]);
    const filterByDifficulty = useCallback((difficulties) => {
        setFilter({ ...state.filter, difficulties });
    }, [state.filter, setFilter]);
    const showFavoritesOnly = useCallback((favoritesOnly) => {
        setFilter({ ...state.filter, favoritesOnly });
    }, [state.filter, setFilter]);
    const showCustomOnly = useCallback((customOnly) => {
        setFilter({ ...state.filter, customOnly });
    }, [state.filter, setFilter]);
    const addMultipleVocabulary = useCallback((vocabularyList) => {
        const newVocabularyList = vocabularyList.map(vocab => ({
            ...vocab,
            id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            studyCount: 0,
            accuracy: 0,
        }));
        newVocabularyList.forEach(vocab => {
            dispatch({ type: VocabularyActionType.ADD_VOCABULARY, payload: vocab });
        });
        return newVocabularyList;
    }, [dispatch]);
    const resetVocabulary = useCallback(() => {
        dispatch({ type: VocabularyActionType.RESET_STATE });
    }, [dispatch]);
    const getVocabularyStats = useCallback(() => {
        return state.stats;
    }, [state.stats]);
    const isFavorite = useCallback((vocabularyId) => {
        return state.favorites.includes(vocabularyId);
    }, [state.favorites]);
    const getFavoriteVocabulary = useCallback(() => {
        return state.vocabulary.filter(vocab => state.favorites.includes(vocab.id));
    }, [state.vocabulary, state.favorites]);
    const getCustomVocabulary = useCallback(() => {
        return state.vocabulary.filter(vocab => vocab.isCustom);
    }, [state.vocabulary]);
    useEffect(() => {
        if (state.initialized) {
            saveVocabularyData();
        }
    }, [state.vocabulary, state.favorites, state.filter, state.sortBy, state.sortDirection, state.initialized, saveVocabularyData]);
    return {
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
        getVocabularyStats,
        isFavorite,
        getFavoriteVocabulary,
        getCustomVocabulary,
    };
};
