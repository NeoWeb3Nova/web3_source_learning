export const STORAGE_KEYS = {
    USER_PROGRESS: 'web3_vocab_user_progress',
    VOCABULARY_LIST: 'web3_vocab_vocabulary_list',
    LEARNING_SESSIONS: 'web3_vocab_learning_sessions',
    USER_SETTINGS: 'web3_vocab_user_settings',
    MASTERED_WORDS: 'web3_vocab_mastered_words',
    FAVORITE_WORDS: 'web3_vocab_favorite_words',
    PRACTICE_RESULTS: 'web3_vocab_practice_results',
    BACKUP_DATA: 'web3_vocab_backup_data',
    LAST_SYNC_TIME: 'web3_vocab_last_sync_time',
};
export class StorageManager {
    static getInstance() {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }
    constructor() {
        Object.defineProperty(this, "syncQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        Object.defineProperty(this, "syncInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.initializeEventListeners();
        this.startAutoSync();
    }
    initializeEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        window.addEventListener('beforeunload', () => {
            this.flushSyncQueue();
        });
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('web3_vocab_')) {
                this.handleStorageChange(e);
            }
        });
    }
    startAutoSync() {
        this.syncInterval = setInterval(() => {
            this.processSyncQueue();
        }, 5000);
    }
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    async saveLearningData(wordId, data) {
        try {
            const existingData = await this.getLearningData(wordId);
            const updatedData = {
                ...existingData,
                ...data,
                wordId,
                lastReviewDate: new Date().toISOString(),
            };
            const allLearningData = await this.getAllLearningData();
            allLearningData[wordId] = updatedData;
            await this.setItem('learning_data', allLearningData);
            this.addToSyncQueue('learning_data', allLearningData);
            await this.updateUserProgress(updatedData);
        }
        catch (error) {
            console.error('Failed to save learning data:', error);
            throw error;
        }
    }
    async getLearningData(wordId) {
        try {
            const allData = await this.getAllLearningData();
            return allData[wordId] || {
                wordId,
                studyTime: 0,
                correctRate: 0,
                reviewCount: 0,
                lastReviewDate: new Date().toISOString(),
                masteryLevel: 1,
                mistakes: [],
            };
        }
        catch (error) {
            console.error('Failed to get learning data:', error);
            return {
                wordId,
                studyTime: 0,
                correctRate: 0,
                reviewCount: 0,
                lastReviewDate: new Date().toISOString(),
                masteryLevel: 1,
                mistakes: [],
            };
        }
    }
    async getAllLearningData() {
        try {
            return await this.getItem('learning_data', {});
        }
        catch (error) {
            console.error('Failed to get all learning data:', error);
            return {};
        }
    }
    async updateUserProgress(learningData) {
        try {
            const userProgress = await this.getUserProgress();
            const today = new Date().toISOString().split('T')[0];
            let todayStats = userProgress.dailyStats.find(stat => stat.date === today);
            if (!todayStats) {
                todayStats = {
                    date: today,
                    wordsStudied: 0,
                    practiceSessions: 0,
                    correctAnswers: 0,
                    totalAnswers: 0,
                    studyTimeMinutes: 0,
                    newMasteredWords: 0,
                };
                userProgress.dailyStats.push(todayStats);
            }
            todayStats.studyTimeMinutes += Math.round(learningData.studyTime / 60000);
            userProgress.totalStudyTime += Math.round(learningData.studyTime / 60000);
            if (learningData.masteryLevel >= 4) {
                if (!userProgress.masteredWords.includes(learningData.wordId)) {
                    userProgress.masteredWords.push(learningData.wordId);
                    todayStats.newMasteredWords += 1;
                }
            }
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const hasYesterdayStats = userProgress.dailyStats.some(stat => stat.date === yesterdayStr);
            if (hasYesterdayStats || userProgress.streakDays === 0) {
                userProgress.streakDays += 1;
                if (userProgress.streakDays > userProgress.maxStreakDays) {
                    userProgress.maxStreakDays = userProgress.streakDays;
                }
            }
            else {
                userProgress.streakDays = 1;
            }
            userProgress.lastStudyTime = new Date();
            userProgress.updatedAt = new Date();
            await this.setItem(STORAGE_KEYS.USER_PROGRESS, userProgress);
            this.addToSyncQueue(STORAGE_KEYS.USER_PROGRESS, userProgress);
        }
        catch (error) {
            console.error('Failed to update user progress:', error);
        }
    }
    async getUserProgress() {
        try {
            const defaultProgress = {
                userId: 'default',
                dailyStats: [],
                streakDays: 0,
                maxStreakDays: 0,
                totalStudyTime: 0,
                masteredWords: [],
                weakWords: [],
                favoriteWords: [],
                achievements: [],
                totalPoints: 0,
                level: 1,
                currentLevelExp: 0,
                nextLevelExp: 100,
                studySessions: [],
                lastStudyTime: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return await this.getItem(STORAGE_KEYS.USER_PROGRESS, defaultProgress);
        }
        catch (error) {
            console.error('Failed to get user progress:', error);
            return {
                userId: 'default',
                dailyStats: [],
                streakDays: 0,
                maxStreakDays: 0,
                totalStudyTime: 0,
                masteredWords: [],
                weakWords: [],
                favoriteWords: [],
                achievements: [],
                totalPoints: 0,
                level: 1,
                currentLevelExp: 0,
                nextLevelExp: 100,
                studySessions: [],
                lastStudyTime: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
    }
    async saveVocabularyList(vocabulary) {
        try {
            await this.setItem(STORAGE_KEYS.VOCABULARY_LIST, vocabulary);
            this.addToSyncQueue(STORAGE_KEYS.VOCABULARY_LIST, vocabulary);
        }
        catch (error) {
            console.error('Failed to save vocabulary list:', error);
            throw error;
        }
    }
    async getVocabularyList() {
        try {
            return await this.getItem(STORAGE_KEYS.VOCABULARY_LIST, []);
        }
        catch (error) {
            console.error('Failed to get vocabulary list:', error);
            return [];
        }
    }
    async saveUserSettings(settings) {
        try {
            await this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
            this.addToSyncQueue(STORAGE_KEYS.USER_SETTINGS, settings);
        }
        catch (error) {
            console.error('Failed to save user settings:', error);
            throw error;
        }
    }
    async getUserSettings() {
        try {
            const defaultSettings = {
                theme: 'light',
                language: 'zh-CN',
                soundEnabled: true,
                notificationsEnabled: true,
                autoPlayAudio: true,
                studyReminder: true,
                dailyGoal: 20,
            };
            return await this.getItem(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
        }
        catch (error) {
            console.error('Failed to get user settings:', error);
            return {
                theme: 'light',
                language: 'zh-CN',
                soundEnabled: true,
                notificationsEnabled: true,
                autoPlayAudio: true,
                studyReminder: true,
                dailyGoal: 20,
            };
        }
    }
    async createBackup() {
        try {
            const backupData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                userProgress: await this.getUserProgress(),
                vocabularyList: await this.getVocabularyList(),
                learningSessions: await this.getItem(STORAGE_KEYS.LEARNING_SESSIONS, []),
                userSettings: await this.getUserSettings(),
                masteredWords: await this.getItem(STORAGE_KEYS.MASTERED_WORDS, []),
                favoriteWords: await this.getItem(STORAGE_KEYS.FAVORITE_WORDS, []),
                practiceResults: await this.getItem(STORAGE_KEYS.PRACTICE_RESULTS, []),
            };
            await this.setItem(STORAGE_KEYS.BACKUP_DATA, backupData);
            return backupData;
        }
        catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }
    async restoreFromBackup(backupData) {
        try {
            await this.setItem(STORAGE_KEYS.USER_PROGRESS, backupData.userProgress);
            await this.setItem(STORAGE_KEYS.VOCABULARY_LIST, backupData.vocabularyList);
            await this.setItem(STORAGE_KEYS.LEARNING_SESSIONS, backupData.learningSessions);
            await this.setItem(STORAGE_KEYS.USER_SETTINGS, backupData.userSettings);
            await this.setItem(STORAGE_KEYS.MASTERED_WORDS, backupData.masteredWords);
            await this.setItem(STORAGE_KEYS.FAVORITE_WORDS, backupData.favoriteWords);
            await this.setItem(STORAGE_KEYS.PRACTICE_RESULTS, backupData.practiceResults);
            this.syncQueue.clear();
        }
        catch (error) {
            console.error('Failed to restore from backup:', error);
            throw error;
        }
    }
    async exportData() {
        try {
            const backupData = await this.createBackup();
            return JSON.stringify(backupData, null, 2);
        }
        catch (error) {
            console.error('Failed to export data:', error);
            throw error;
        }
    }
    async importData(jsonData) {
        try {
            const backupData = JSON.parse(jsonData);
            await this.restoreFromBackup(backupData);
        }
        catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }
    async clearAllData() {
        try {
            const keys = Object.values(STORAGE_KEYS);
            for (const key of keys) {
                localStorage.removeItem(key);
            }
            this.syncQueue.clear();
        }
        catch (error) {
            console.error('Failed to clear all data:', error);
            throw error;
        }
    }
    getStorageUsage() {
        try {
            let used = 0;
            const keys = Object.values(STORAGE_KEYS);
            for (const key of keys) {
                const item = localStorage.getItem(key);
                if (item) {
                    used += item.length;
                }
            }
            const total = 5 * 1024 * 1024;
            const percentage = (used / total) * 100;
            return { used, total, percentage };
        }
        catch (error) {
            console.error('Failed to get storage usage:', error);
            return { used: 0, total: 0, percentage: 0 };
        }
    }
    async setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        }
        catch (error) {
            if (error instanceof DOMException && error.code === 22) {
                await this.handleStorageQuotaExceeded();
                throw new Error('Storage quota exceeded');
            }
            throw error;
        }
    }
    async getItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        }
        catch (error) {
            console.error(`Failed to parse stored item for key ${key}:`, error);
            return defaultValue;
        }
    }
    async handleStorageQuotaExceeded() {
        try {
            const sessions = await this.getItem(STORAGE_KEYS.LEARNING_SESSIONS, []);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const recentSessions = sessions.filter((session) => new Date(session.date) > oneMonthAgo);
            await this.setItem(STORAGE_KEYS.LEARNING_SESSIONS, recentSessions);
            const practiceResults = await this.getItem(STORAGE_KEYS.PRACTICE_RESULTS, []);
            const recentResults = practiceResults.filter((result) => new Date(result.date) > oneMonthAgo);
            await this.setItem(STORAGE_KEYS.PRACTICE_RESULTS, recentResults);
        }
        catch (error) {
            console.error('Failed to handle storage quota exceeded:', error);
        }
    }
    addToSyncQueue(key, data) {
        this.syncQueue.set(key, data);
    }
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.size === 0) {
            return;
        }
        try {
            this.syncQueue.clear();
            await this.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
        }
        catch (error) {
            console.error('Failed to process sync queue:', error);
        }
    }
    flushSyncQueue() {
        this.processSyncQueue();
    }
    handleStorageChange(event) {
        window.dispatchEvent(new CustomEvent('storageDataChanged', {
            detail: {
                key: event.key,
                newValue: event.newValue,
                oldValue: event.oldValue,
            }
        }));
    }
}
export const storageManager = StorageManager.getInstance();
