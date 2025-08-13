import { useEffect, useState, useCallback, useRef } from 'react';
import { storageManager } from '@/services/storageManager';
export const useDataPersistence = (config = {
    enabled: true,
    interval: 30000,
    debounceDelay: 1000,
}) => {
    const [state, setState] = useState({
        isLoading: false,
        isSaving: false,
        isRestoring: false,
        lastSaveTime: null,
        lastSyncTime: null,
        hasUnsavedChanges: false,
        storageUsage: { used: 0, total: 0, percentage: 0 },
    });
    const saveTimeoutRef = useRef(null);
    const autoSaveIntervalRef = useRef(null);
    const pendingChangesRef = useRef(new Map());
    const updateStorageUsage = useCallback(() => {
        const usage = storageManager.getStorageUsage();
        setState(prev => ({ ...prev, storageUsage: usage }));
    }, []);
    const saveLearningData = useCallback(async (wordId, data) => {
        try {
            setState(prev => ({ ...prev, isSaving: true, hasUnsavedChanges: true }));
            await storageManager.saveLearningData(wordId, data);
            setState(prev => ({
                ...prev,
                isSaving: false,
                hasUnsavedChanges: false,
                lastSaveTime: new Date(),
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
            console.error('Failed to save learning data:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const getLearningData = useCallback(async (wordId) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const data = await storageManager.getLearningData(wordId);
            setState(prev => ({ ...prev, isLoading: false }));
            return data;
        }
        catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            console.error('Failed to get learning data:', error);
            throw error;
        }
    }, []);
    const saveUserProgress = useCallback(async (progress) => {
        try {
            setState(prev => ({ ...prev, isSaving: true }));
            await storageManager.setItem('user_progress', progress);
            setState(prev => ({
                ...prev,
                isSaving: false,
                lastSaveTime: new Date(),
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
            console.error('Failed to save user progress:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const getUserProgress = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const progress = await storageManager.getUserProgress();
            setState(prev => ({ ...prev, isLoading: false }));
            return progress;
        }
        catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            console.error('Failed to get user progress:', error);
            throw error;
        }
    }, []);
    const saveVocabularyList = useCallback(async (vocabulary) => {
        try {
            setState(prev => ({ ...prev, isSaving: true }));
            await storageManager.saveVocabularyList(vocabulary);
            setState(prev => ({
                ...prev,
                isSaving: false,
                lastSaveTime: new Date(),
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
            console.error('Failed to save vocabulary list:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const getVocabularyList = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const vocabulary = await storageManager.getVocabularyList();
            setState(prev => ({ ...prev, isLoading: false }));
            return vocabulary;
        }
        catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            console.error('Failed to get vocabulary list:', error);
            throw error;
        }
    }, []);
    const saveUserSettings = useCallback(async (settings) => {
        try {
            setState(prev => ({ ...prev, isSaving: true }));
            await storageManager.saveUserSettings(settings);
            setState(prev => ({
                ...prev,
                isSaving: false,
                lastSaveTime: new Date(),
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
            console.error('Failed to save user settings:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const getUserSettings = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const settings = await storageManager.getUserSettings();
            setState(prev => ({ ...prev, isLoading: false }));
            return settings;
        }
        catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            console.error('Failed to get user settings:', error);
            throw error;
        }
    }, []);
    const debouncedSave = useCallback((key, data) => {
        pendingChangesRef.current.set(key, data);
        setState(prev => ({ ...prev, hasUnsavedChanges: true }));
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                setState(prev => ({ ...prev, isSaving: true }));
                for (const [saveKey, saveData] of pendingChangesRef.current.entries()) {
                    switch (saveKey) {
                        case 'userProgress':
                            await storageManager.setItem('user_progress', saveData);
                            break;
                        case 'vocabularyList':
                            await storageManager.saveVocabularyList(saveData);
                            break;
                        case 'userSettings':
                            await storageManager.saveUserSettings(saveData);
                            break;
                        default:
                            await storageManager.setItem(saveKey, saveData);
                    }
                }
                pendingChangesRef.current.clear();
                setState(prev => ({
                    ...prev,
                    isSaving: false,
                    hasUnsavedChanges: false,
                    lastSaveTime: new Date(),
                }));
                updateStorageUsage();
            }
            catch (error) {
                setState(prev => ({ ...prev, isSaving: false }));
                console.error('Failed to save data:', error);
            }
        }, config.debounceDelay);
    }, [config.debounceDelay, updateStorageUsage]);
    const createBackup = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isSaving: true }));
            const backup = await storageManager.createBackup();
            setState(prev => ({
                ...prev,
                isSaving: false,
                lastSaveTime: new Date(),
            }));
            return backup;
        }
        catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
            console.error('Failed to create backup:', error);
            throw error;
        }
    }, []);
    const restoreBackup = useCallback(async (backupData) => {
        try {
            setState(prev => ({ ...prev, isRestoring: true }));
            await storageManager.restoreFromBackup(backupData);
            setState(prev => ({
                ...prev,
                isRestoring: false,
                lastSaveTime: new Date(),
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isRestoring: false }));
            console.error('Failed to restore backup:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const exportData = useCallback(async () => {
        try {
            return await storageManager.exportData();
        }
        catch (error) {
            console.error('Failed to export data:', error);
            throw error;
        }
    }, []);
    const importData = useCallback(async (jsonData) => {
        try {
            setState(prev => ({ ...prev, isRestoring: true }));
            await storageManager.importData(jsonData);
            setState(prev => ({
                ...prev,
                isRestoring: false,
                lastSaveTime: new Date(),
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isRestoring: false }));
            console.error('Failed to import data:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const clearAllData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isSaving: true }));
            await storageManager.clearAllData();
            setState(prev => ({
                ...prev,
                isSaving: false,
                lastSaveTime: new Date(),
                hasUnsavedChanges: false,
            }));
            updateStorageUsage();
        }
        catch (error) {
            setState(prev => ({ ...prev, isSaving: false }));
            console.error('Failed to clear all data:', error);
            throw error;
        }
    }, [updateStorageUsage]);
    const forceSave = useCallback(async () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        if (pendingChangesRef.current.size > 0) {
            try {
                setState(prev => ({ ...prev, isSaving: true }));
                for (const [key, data] of pendingChangesRef.current.entries()) {
                    await storageManager.setItem(key, data);
                }
                pendingChangesRef.current.clear();
                setState(prev => ({
                    ...prev,
                    isSaving: false,
                    hasUnsavedChanges: false,
                    lastSaveTime: new Date(),
                }));
                updateStorageUsage();
            }
            catch (error) {
                setState(prev => ({ ...prev, isSaving: false }));
                console.error('Failed to force save:', error);
                throw error;
            }
        }
    }, [updateStorageUsage]);
    useEffect(() => {
        updateStorageUsage();
        if (config.enabled) {
            autoSaveIntervalRef.current = setInterval(() => {
                if (pendingChangesRef.current.size > 0) {
                    forceSave();
                }
            }, config.interval);
        }
        const handleStorageChange = (event) => {
            updateStorageUsage();
            setState(prev => ({ ...prev, lastSyncTime: new Date() }));
        };
        window.addEventListener('storageDataChanged', handleStorageChange);
        const handleBeforeUnload = () => {
            if (pendingChangesRef.current.size > 0) {
                for (const [key, data] of pendingChangesRef.current.entries()) {
                    try {
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                    catch (error) {
                        console.error('Failed to save data on unload:', error);
                    }
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
            window.removeEventListener('storageDataChanged', handleStorageChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            handleBeforeUnload();
        };
    }, [config.enabled, config.interval, forceSave, updateStorageUsage]);
    return {
        ...state,
        saveLearningData,
        getLearningData,
        saveUserProgress,
        getUserProgress,
        saveVocabularyList,
        getVocabularyList,
        saveUserSettings,
        getUserSettings,
        debouncedSave,
        createBackup,
        restoreBackup,
        exportData,
        importData,
        clearAllData,
        forceSave,
        updateStorageUsage,
    };
};
export const useAppStateRestore = () => {
    const [isRestoring, setIsRestoring] = useState(true);
    const [restoredData, setRestoredData] = useState({
        userProgress: null,
        vocabularyList: [],
        userSettings: null,
    });
    useEffect(() => {
        const restoreAppState = async () => {
            try {
                setIsRestoring(true);
                const [userProgress, vocabularyList, userSettings] = await Promise.all([
                    storageManager.getUserProgress(),
                    storageManager.getVocabularyList(),
                    storageManager.getUserSettings(),
                ]);
                setRestoredData({
                    userProgress,
                    vocabularyList,
                    userSettings,
                });
            }
            catch (error) {
                console.error('Failed to restore app state:', error);
            }
            finally {
                setIsRestoring(false);
            }
        };
        restoreAppState();
    }, []);
    return {
        isRestoring,
        restoredData,
    };
};
