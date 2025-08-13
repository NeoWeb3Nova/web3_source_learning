/**
 * 内容更新管理Hook
 * 提供内容更新检查、下载和应用功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { UpdateInfo, UpdateType, UpdateStatus } from '@/components/common/ContentUpdateNotification';
import { storageManager } from '@/services/storageManager';

/**
 * 内容更新配置
 */
interface ContentUpdateConfig {
  /** 检查更新间隔（毫秒） */
  checkInterval: number;
  /** 是否自动检查更新 */
  autoCheck: boolean;
  /** 是否自动下载更新 */
  autoDownload: boolean;
  /** 更新服务器URL */
  updateServerUrl: string;
  /** 最大重试次数 */
  maxRetries: number;
}

/**
 * 内容更新状态
 */
interface ContentUpdateState {
  /** 可用更新列表 */
  availableUpdates: UpdateInfo[];
  /** 当前更新信息 */
  currentUpdate: UpdateInfo | null;
  /** 更新状态 */
  status: UpdateStatus;
  /** 下载进度 */
  progress: number;
  /** 是否正在检查更新 */
  isChecking: boolean;
  /** 错误信息 */
  error: string | null;
  /** 最后检查时间 */
  lastCheckTime: Date | null;
  /** 忽略的更新ID列表 */
  ignoredUpdates: string[];
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ContentUpdateConfig = {
  checkInterval: 30 * 60 * 1000, // 30分钟
  autoCheck: true,
  autoDownload: false,
  updateServerUrl: '/api/updates',
  maxRetries: 3,
};

/**
 * 模拟更新数据（实际项目中应该从服务器获取）
 */
const MOCK_UPDATES: UpdateInfo[] = [
  {
    id: 'vocab-update-001',
    type: UpdateType.VOCABULARY,
    title: '新增100个DeFi词汇',
    description: '本次更新新增了100个最新的DeFi领域专业词汇，包括流动性挖矿、收益农场等热门概念。',
    version: '1.2.0',
    size: 2048000, // 2MB
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    critical: false,
    changes: [
      '新增流动性挖矿相关词汇50个',
      '新增收益农场相关词汇30个',
      '新增跨链桥相关词汇20个',
      '优化词汇分类和标签',
      '修复部分词汇发音问题',
    ],
    downloadUrl: '/api/updates/vocab-update-001/download',
  },
  {
    id: 'content-update-002',
    type: UpdateType.CONTENT,
    title: '练习题库更新',
    description: '更新了练习题库，新增了多种题型和难度级别，提升学习体验。',
    version: '1.1.5',
    size: 1536000, // 1.5MB
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
    critical: false,
    changes: [
      '新增选择题200道',
      '新增填空题150道',
      '新增听力题100道',
      '优化题目难度分级',
      '修复题目显示问题',
    ],
    downloadUrl: '/api/updates/content-update-002/download',
  },
];

/**
 * 内容更新Hook
 */
export const useContentUpdate = (config: Partial<ContentUpdateConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const toast = useToast();

  const [state, setState] = useState<ContentUpdateState>({
    availableUpdates: [],
    currentUpdate: null,
    status: UpdateStatus.AVAILABLE,
    progress: 0,
    isChecking: false,
    error: null,
    lastCheckTime: null,
    ignoredUpdates: [],
  });

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 检查更新
   */
  const checkForUpdates = useCallback(async (showToast = false): Promise<UpdateInfo[]> => {
    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 在实际项目中，这里应该是真实的API调用
      // const response = await fetch(`${finalConfig.updateServerUrl}/check`);
      // const updates = await response.json();

      // 使用模拟数据
      const updates = MOCK_UPDATES.filter(update => {
        // 过滤掉已忽略的更新
        return !state.ignoredUpdates.includes(update.id);
      });

      setState(prev => ({
        ...prev,
        availableUpdates: updates,
        isChecking: false,
        lastCheckTime: new Date(),
      }));

      if (showToast && updates.length > 0) {
        toast({
          title: '发现新更新',
          description: `发现 ${updates.length} 个可用更新`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

      retryCountRef.current = 0;
      return updates;
    } catch (error) {
      console.error('Check for updates failed:', error);
      
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error.message : '检查更新失败',
      }));

      if (showToast) {
        toast({
          title: '检查更新失败',
          description: '请检查网络连接后重试',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }

      return [];
    }
  }, [finalConfig.updateServerUrl, state.ignoredUpdates, toast]);

  /**
   * 开始更新
   */
  const startUpdate = useCallback(async (updateInfo: UpdateInfo) => {
    setState(prev => ({
      ...prev,
      currentUpdate: updateInfo,
      status: UpdateStatus.DOWNLOADING,
      progress: 0,
      error: null,
    }));

    try {
      // 创建AbortController用于取消下载
      abortControllerRef.current = new AbortController();

      // 模拟下载过程
      for (let i = 0; i <= 100; i += 10) {
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Download cancelled');
        }

        setState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 下载完成，准备安装
      setState(prev => ({ ...prev, status: UpdateStatus.READY }));

      toast({
        title: '下载完成',
        description: '更新已下载完成，点击应用更新',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Download failed:', error);
      
      setState(prev => ({
        ...prev,
        status: UpdateStatus.FAILED,
        error: error instanceof Error ? error.message : '下载失败',
      }));

      toast({
        title: '下载失败',
        description: '更新下载失败，请重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  /**
   * 取消更新
   */
  const cancelUpdate = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState(prev => ({
      ...prev,
      currentUpdate: null,
      status: UpdateStatus.AVAILABLE,
      progress: 0,
      error: null,
    }));

    toast({
      title: '更新已取消',
      description: '更新下载已取消',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * 应用更新
   */
  const applyUpdate = useCallback(async () => {
    if (!state.currentUpdate) return;

    setState(prev => ({ ...prev, status: UpdateStatus.INSTALLING, progress: 0 }));

    try {
      // 模拟安装过程
      for (let i = 0; i <= 100; i += 20) {
        setState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // 根据更新类型执行不同的安装逻辑
      switch (state.currentUpdate.type) {
        case UpdateType.VOCABULARY:
          // 更新词汇数据
          await updateVocabularyData(state.currentUpdate);
          break;
        case UpdateType.CONTENT:
          // 更新内容数据
          await updateContentData(state.currentUpdate);
          break;
        case UpdateType.FEATURE:
          // 更新功能
          await updateFeatures(state.currentUpdate);
          break;
        case UpdateType.SYSTEM:
          // 系统更新
          await updateSystem(state.currentUpdate);
          break;
      }

      // 从可用更新列表中移除已安装的更新
      setState(prev => ({
        ...prev,
        availableUpdates: prev.availableUpdates.filter(u => u.id !== state.currentUpdate?.id),
        currentUpdate: null,
        status: UpdateStatus.COMPLETED,
        progress: 100,
      }));

      toast({
        title: '更新完成',
        description: `${state.currentUpdate.title} 已成功更新`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // 3秒后重置状态
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: UpdateStatus.AVAILABLE,
          progress: 0,
        }));
      }, 3000);
    } catch (error) {
      console.error('Apply update failed:', error);
      
      setState(prev => ({
        ...prev,
        status: UpdateStatus.FAILED,
        error: error instanceof Error ? error.message : '安装失败',
      }));

      toast({
        title: '安装失败',
        description: '更新安装失败，请重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [state.currentUpdate, toast]);

  /**
   * 忽略更新
   */
  const ignoreUpdate = useCallback(async (updateId: string) => {
    const newIgnoredUpdates = [...state.ignoredUpdates, updateId];
    
    setState(prev => ({
      ...prev,
      ignoredUpdates: newIgnoredUpdates,
      availableUpdates: prev.availableUpdates.filter(u => u.id !== updateId),
    }));

    // 保存到本地存储
    try {
      await storageManager.setItem('ignored_updates', newIgnoredUpdates);
    } catch (error) {
      console.error('Failed to save ignored updates:', error);
    }

    toast({
      title: '已忽略更新',
      description: '该更新已被忽略，不会再次提醒',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [state.ignoredUpdates, toast]);

  /**
   * 重置更新状态
   */
  const resetUpdateState = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUpdate: null,
      status: UpdateStatus.AVAILABLE,
      progress: 0,
      error: null,
    }));
  }, []);

  /**
   * 更新词汇数据
   */
  const updateVocabularyData = async (updateInfo: UpdateInfo) => {
    // 模拟更新词汇数据
    console.log('Updating vocabulary data:', updateInfo);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * 更新内容数据
   */
  const updateContentData = async (updateInfo: UpdateInfo) => {
    // 模拟更新内容数据
    console.log('Updating content data:', updateInfo);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * 更新功能
   */
  const updateFeatures = async (updateInfo: UpdateInfo) => {
    // 模拟更新功能
    console.log('Updating features:', updateInfo);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * 系统更新
   */
  const updateSystem = async (updateInfo: UpdateInfo) => {
    // 模拟系统更新
    console.log('Updating system:', updateInfo);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * 初始化
   */
  useEffect(() => {
    // 加载忽略的更新列表
    const loadIgnoredUpdates = async () => {
      try {
        const ignored = await storageManager.getItem('ignored_updates', []);
        setState(prev => ({ ...prev, ignoredUpdates: ignored }));
      } catch (error) {
        console.error('Failed to load ignored updates:', error);
      }
    };

    loadIgnoredUpdates();

    // 首次检查更新
    if (finalConfig.autoCheck) {
      checkForUpdates();
    }
  }, [finalConfig.autoCheck, checkForUpdates]);

  /**
   * 设置定时检查
   */
  useEffect(() => {
    if (finalConfig.autoCheck && finalConfig.checkInterval > 0) {
      checkIntervalRef.current = setInterval(() => {
        checkForUpdates();
      }, finalConfig.checkInterval);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [finalConfig.autoCheck, finalConfig.checkInterval, checkForUpdates]);

  /**
   * 清理
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // 状态
    ...state,
    
    // 方法
    checkForUpdates,
    startUpdate,
    cancelUpdate,
    applyUpdate,
    ignoreUpdate,
    resetUpdateState,
    
    // 计算属性
    hasUpdates: state.availableUpdates.length > 0,
    isUpdating: state.status === UpdateStatus.DOWNLOADING || state.status === UpdateStatus.INSTALLING,
  };
};