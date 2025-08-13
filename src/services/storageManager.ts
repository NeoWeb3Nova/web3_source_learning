/**
 * 数据持久化和本地存储管理器
 * 提供用户学习数据的本地存储、备份和恢复功能
 */

import { VocabularyItem, UserProgress, UserSettings, StudySession } from '@/types';

/**
 * 存储键名常量
 */
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
} as const;

/**
 * 学习数据接口
 */
export interface LearningData {
  wordId: string;
  studyTime: number; // 学习时间（毫秒）
  correctRate: number; // 正确率（0-1）
  reviewCount: number; // 复习次数
  lastReviewDate: string; // 最后复习日期
  masteryLevel: number; // 掌握程度（1-5）
  mistakes: string[]; // 错误记录
}

/**
 * 备份数据结构
 */
export interface BackupData {
  version: string;
  timestamp: string;
  userProgress: UserProgress;
  vocabularyList: VocabularyItem[];
  learningSessions: StudySession[];
  userSettings: UserSettings;
  masteredWords: string[];
  favoriteWords: string[];
  practiceResults: any[];
}

/**
 * 存储管理器类
 */
export class StorageManager {
  private static instance: StorageManager;
  private syncQueue: Map<string, any> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  constructor() {
    this.initializeEventListeners();
    this.startAutoSync();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners() {
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 监听页面卸载，保存数据
    window.addEventListener('beforeunload', () => {
      this.flushSyncQueue();
    });

    // 监听存储变化（多标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('web3_vocab_')) {
        this.handleStorageChange(e);
      }
    });
  }

  /**
   * 启动自动同步
   */
  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
    }, 5000); // 每5秒同步一次
  }

  /**
   * 停止自动同步
   */
  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 保存用户学习数据
   */
  async saveLearningData(wordId: string, data: Partial<LearningData>): Promise<void> {
    try {
      const existingData = await this.getLearningData(wordId);
      const updatedData: LearningData = {
        ...existingData,
        ...data,
        wordId,
        lastReviewDate: new Date().toISOString(),
      };

      const allLearningData = await this.getAllLearningData();
      allLearningData[wordId] = updatedData;

      await this.setItem('learning_data', allLearningData);
      this.addToSyncQueue('learning_data', allLearningData);

      // 更新用户进度
      await this.updateUserProgress(updatedData);
    } catch (error) {
      console.error('Failed to save learning data:', error);
      throw error;
    }
  }

  /**
   * 获取单词学习数据
   */
  async getLearningData(wordId: string): Promise<LearningData> {
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
    } catch (error) {
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

  /**
   * 获取所有学习数据
   */
  async getAllLearningData(): Promise<Record<string, LearningData>> {
    try {
      return await this.getItem('learning_data', {});
    } catch (error) {
      console.error('Failed to get all learning data:', error);
      return {};
    }
  }

  /**
   * 更新用户进度
   */
  private async updateUserProgress(learningData: LearningData): Promise<void> {
    try {
      const userProgress = await this.getUserProgress();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式

      // 查找或创建今日统计
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

      // 更新今日学习时间（转换为分钟）
      todayStats.studyTimeMinutes += Math.round(learningData.studyTime / 60000);
      userProgress.totalStudyTime += Math.round(learningData.studyTime / 60000);

      // 更新掌握词汇量
      if (learningData.masteryLevel >= 4) {
        if (!userProgress.masteredWords.includes(learningData.wordId)) {
          userProgress.masteredWords.push(learningData.wordId);
          todayStats.newMasteredWords += 1;
        }
      }

      // 更新连续学习天数
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const hasYesterdayStats = userProgress.dailyStats.some(stat => stat.date === yesterdayStr);
      if (hasYesterdayStats || userProgress.streakDays === 0) {
        userProgress.streakDays += 1;
        if (userProgress.streakDays > userProgress.maxStreakDays) {
          userProgress.maxStreakDays = userProgress.streakDays;
        }
      } else {
        userProgress.streakDays = 1;
      }

      userProgress.lastStudyTime = new Date();
      userProgress.updatedAt = new Date();

      await this.setItem(STORAGE_KEYS.USER_PROGRESS, userProgress);
      this.addToSyncQueue(STORAGE_KEYS.USER_PROGRESS, userProgress);
    } catch (error) {
      console.error('Failed to update user progress:', error);
    }
  }

  /**
   * 获取用户进度
   */
  async getUserProgress(): Promise<UserProgress> {
    try {
      const defaultProgress: UserProgress = {
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
    } catch (error) {
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

  /**
   * 保存词汇列表
   */
  async saveVocabularyList(vocabulary: VocabularyItem[]): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.VOCABULARY_LIST, vocabulary);
      this.addToSyncQueue(STORAGE_KEYS.VOCABULARY_LIST, vocabulary);
    } catch (error) {
      console.error('Failed to save vocabulary list:', error);
      throw error;
    }
  }

  /**
   * 获取词汇列表
   */
  async getVocabularyList(): Promise<VocabularyItem[]> {
    try {
      return await this.getItem(STORAGE_KEYS.VOCABULARY_LIST, []);
    } catch (error) {
      console.error('Failed to get vocabulary list:', error);
      return [];
    }
  }

  /**
   * 保存用户设置
   */
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
      this.addToSyncQueue(STORAGE_KEYS.USER_SETTINGS, settings);
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw error;
    }
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      const defaultSettings: UserSettings = {
        theme: 'light',
        language: 'zh-CN',
        soundEnabled: true,
        notificationsEnabled: true,
        autoPlayAudio: true,
        studyReminder: true,
        dailyGoal: 20,
      };

      return await this.getItem(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
    } catch (error) {
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

  /**
   * 创建数据备份
   */
  async createBackup(): Promise<BackupData> {
    try {
      const backupData: BackupData = {
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
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * 恢复数据
   */
  async restoreFromBackup(backupData: BackupData): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.USER_PROGRESS, backupData.userProgress);
      await this.setItem(STORAGE_KEYS.VOCABULARY_LIST, backupData.vocabularyList);
      await this.setItem(STORAGE_KEYS.LEARNING_SESSIONS, backupData.learningSessions);
      await this.setItem(STORAGE_KEYS.USER_SETTINGS, backupData.userSettings);
      await this.setItem(STORAGE_KEYS.MASTERED_WORDS, backupData.masteredWords);
      await this.setItem(STORAGE_KEYS.FAVORITE_WORDS, backupData.favoriteWords);
      await this.setItem(STORAGE_KEYS.PRACTICE_RESULTS, backupData.practiceResults);

      // 清空同步队列，避免覆盖恢复的数据
      this.syncQueue.clear();
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  /**
   * 导出数据为JSON
   */
  async exportData(): Promise<string> {
    try {
      const backupData = await this.createBackup();
      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * 从JSON导入数据
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const backupData: BackupData = JSON.parse(jsonData);
      await this.restoreFromBackup(backupData);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      for (const key of keys) {
        localStorage.removeItem(key);
      }
      this.syncQueue.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      const keys = Object.values(STORAGE_KEYS);
      
      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      }

      // localStorage通常限制为5-10MB，这里假设5MB
      const total = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * 基础存储方法
   */
  private async setItem(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // 存储空间不足
        await this.handleStorageQuotaExceeded();
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to parse stored item for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * 处理存储空间不足
   */
  private async handleStorageQuotaExceeded(): Promise<void> {
    try {
      // 清理旧的学习会话数据
      const sessions = await this.getItem(STORAGE_KEYS.LEARNING_SESSIONS, []);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const recentSessions = sessions.filter((session: any) => 
        new Date(session.date) > oneMonthAgo
      );
      
      await this.setItem(STORAGE_KEYS.LEARNING_SESSIONS, recentSessions);

      // 清理旧的练习结果
      const practiceResults = await this.getItem(STORAGE_KEYS.PRACTICE_RESULTS, []);
      const recentResults = practiceResults.filter((result: any) => 
        new Date(result.date) > oneMonthAgo
      );
      
      await this.setItem(STORAGE_KEYS.PRACTICE_RESULTS, recentResults);
    } catch (error) {
      console.error('Failed to handle storage quota exceeded:', error);
    }
  }

  /**
   * 添加到同步队列
   */
  private addToSyncQueue(key: string, data: any): void {
    this.syncQueue.set(key, data);
  }

  /**
   * 处理同步队列
   */
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.size === 0) {
      return;
    }

    try {
      // 这里可以添加云端同步逻辑
      // 目前只是清空队列
      this.syncQueue.clear();
      await this.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    }
  }

  /**
   * 刷新同步队列
   */
  private flushSyncQueue(): void {
    // 强制同步所有待同步数据
    this.processSyncQueue();
  }

  /**
   * 处理存储变化（多标签页同步）
   */
  private handleStorageChange(event: StorageEvent): void {
    // 通知其他组件存储数据已变化
    window.dispatchEvent(new CustomEvent('storageDataChanged', {
      detail: {
        key: event.key,
        newValue: event.newValue,
        oldValue: event.oldValue,
      }
    }));
  }
}

// 导出单例实例
export const storageManager = StorageManager.getInstance();