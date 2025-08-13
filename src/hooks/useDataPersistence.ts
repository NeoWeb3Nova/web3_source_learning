/**
 * 数据持久化Hook
 * 提供自动保存、状态恢复和数据同步功能
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { storageManager, LearningData, BackupData } from '@/services/storageManager';
import { VocabularyItem, UserProgress, UserSettings } from '@/types';

/**
 * 数据持久化状态
 */
interface DataPersistenceState {
  isLoading: boolean;
  isSaving: boolean;
  isRestoring: boolean;
  lastSaveTime: Date | null;
  lastSyncTime: Date | null;
  hasUnsavedChanges: boolean;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

/**
 * 自动保存配置
 */
interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // 毫秒
  debounceDelay: number; // 毫秒
}

/**
 * 数据持久化Hook
 */
export const useDataPersistence = (config: AutoSaveConfig = {
  enabled: true,
  interval: 30000, // 30秒
  debounceDelay: 1000, // 1秒
}) => {
  const [state, setState] = useState<DataPersistenceState>({
    isLoading: false,
    isSaving: false,
    isRestoring: false,
    lastSaveTime: null,
    lastSyncTime: null,
    hasUnsavedChanges: false,
    storageUsage: { used: 0, total: 0, percentage: 0 },
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Map<string, any>>(new Map());

  /**
   * 更新存储使用情况
   */
  const updateStorageUsage = useCallback(() => {
    const usage = storageManager.getStorageUsage();
    setState(prev => ({ ...prev, storageUsage: usage }));
  }, []);

  /**
   * 保存学习数据
   */
  const saveLearningData = useCallback(async (
    wordId: string, 
    data: Partial<LearningData>
  ): Promise<void> => {
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
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Failed to save learning data:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 获取学习数据
   */
  const getLearningData = useCallback(async (wordId: string): Promise<LearningData> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const data = await storageManager.getLearningData(wordId);
      setState(prev => ({ ...prev, isLoading: false }));
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Failed to get learning data:', error);
      throw error;
    }
  }, []);

  /**
   * 保存用户进度
   */
  const saveUserProgress = useCallback(async (progress: UserProgress): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      await storageManager.setItem('user_progress', progress);
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        lastSaveTime: new Date(),
      }));
      updateStorageUsage();
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Failed to save user progress:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 获取用户进度
   */
  const getUserProgress = useCallback(async (): Promise<UserProgress> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const progress = await storageManager.getUserProgress();
      setState(prev => ({ ...prev, isLoading: false }));
      return progress;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Failed to get user progress:', error);
      throw error;
    }
  }, []);

  /**
   * 保存词汇列表
   */
  const saveVocabularyList = useCallback(async (vocabulary: VocabularyItem[]): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      await storageManager.saveVocabularyList(vocabulary);
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        lastSaveTime: new Date(),
      }));
      updateStorageUsage();
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Failed to save vocabulary list:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 获取词汇列表
   */
  const getVocabularyList = useCallback(async (): Promise<VocabularyItem[]> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const vocabulary = await storageManager.getVocabularyList();
      setState(prev => ({ ...prev, isLoading: false }));
      return vocabulary;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Failed to get vocabulary list:', error);
      throw error;
    }
  }, []);

  /**
   * 保存用户设置
   */
  const saveUserSettings = useCallback(async (settings: UserSettings): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      await storageManager.saveUserSettings(settings);
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        lastSaveTime: new Date(),
      }));
      updateStorageUsage();
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Failed to save user settings:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 获取用户设置
   */
  const getUserSettings = useCallback(async (): Promise<UserSettings> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const settings = await storageManager.getUserSettings();
      setState(prev => ({ ...prev, isLoading: false }));
      return settings;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Failed to get user settings:', error);
      throw error;
    }
  }, []);

  /**
   * 防抖保存
   */
  const debouncedSave = useCallback((key: string, data: any) => {
    pendingChangesRef.current.set(key, data);
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        
        // 批量保存所有待保存的数据
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
      } catch (error) {
        setState(prev => ({ ...prev, isSaving: false }));
        console.error('Failed to save data:', error);
      }
    }, config.debounceDelay);
  }, [config.debounceDelay, updateStorageUsage]);

  /**
   * 创建备份
   */
  const createBackup = useCallback(async (): Promise<BackupData> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      const backup = await storageManager.createBackup();
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        lastSaveTime: new Date(),
      }));
      return backup;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Failed to create backup:', error);
      throw error;
    }
  }, []);

  /**
   * 恢复备份
   */
  const restoreBackup = useCallback(async (backupData: BackupData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRestoring: true }));
      await storageManager.restoreFromBackup(backupData);
      setState(prev => ({ 
        ...prev, 
        isRestoring: false,
        lastSaveTime: new Date(),
      }));
      updateStorageUsage();
    } catch (error) {
      setState(prev => ({ ...prev, isRestoring: false }));
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 导出数据
   */
  const exportData = useCallback(async (): Promise<string> => {
    try {
      return await storageManager.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  /**
   * 导入数据
   */
  const importData = useCallback(async (jsonData: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRestoring: true }));
      await storageManager.importData(jsonData);
      setState(prev => ({ 
        ...prev, 
        isRestoring: false,
        lastSaveTime: new Date(),
      }));
      updateStorageUsage();
    } catch (error) {
      setState(prev => ({ ...prev, isRestoring: false }));
      console.error('Failed to import data:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 清除所有数据
   */
  const clearAllData = useCallback(async (): Promise<void> => {
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
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }, [updateStorageUsage]);

  /**
   * 强制保存所有待保存数据
   */
  const forceSave = useCallback(async (): Promise<void> => {
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
      } catch (error) {
        setState(prev => ({ ...prev, isSaving: false }));
        console.error('Failed to force save:', error);
        throw error;
      }
    }
  }, [updateStorageUsage]);

  /**
   * 初始化和清理
   */
  useEffect(() => {
    // 初始化存储使用情况
    updateStorageUsage();

    // 设置自动保存
    if (config.enabled) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (pendingChangesRef.current.size > 0) {
          forceSave();
        }
      }, config.interval);
    }

    // 监听存储变化事件
    const handleStorageChange = (event: CustomEvent) => {
      updateStorageUsage();
      setState(prev => ({ ...prev, lastSyncTime: new Date() }));
    };

    window.addEventListener('storageDataChanged', handleStorageChange as EventListener);

    // 监听页面卸载，保存数据
    const handleBeforeUnload = () => {
      if (pendingChangesRef.current.size > 0) {
        // 同步保存（不使用async）
        for (const [key, data] of pendingChangesRef.current.entries()) {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (error) {
            console.error('Failed to save data on unload:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // 清理定时器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }

      // 移除事件监听器
      window.removeEventListener('storageDataChanged', handleStorageChange as EventListener);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 强制保存待保存数据
      handleBeforeUnload();
    };
  }, [config.enabled, config.interval, forceSave, updateStorageUsage]);

  return {
    // 状态
    ...state,
    
    // 学习数据方法
    saveLearningData,
    getLearningData,
    
    // 用户进度方法
    saveUserProgress,
    getUserProgress,
    
    // 词汇列表方法
    saveVocabularyList,
    getVocabularyList,
    
    // 用户设置方法
    saveUserSettings,
    getUserSettings,
    
    // 防抖保存
    debouncedSave,
    
    // 备份和恢复
    createBackup,
    restoreBackup,
    exportData,
    importData,
    
    // 数据管理
    clearAllData,
    forceSave,
    
    // 工具方法
    updateStorageUsage,
  };
};

/**
 * 应用状态恢复Hook
 * 在应用启动时恢复用户的学习状态
 */
export const useAppStateRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoredData, setRestoredData] = useState<{
    userProgress: UserProgress | null;
    vocabularyList: VocabularyItem[];
    userSettings: UserSettings | null;
  }>({
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
      } catch (error) {
        console.error('Failed to restore app state:', error);
      } finally {
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