import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { UpdateType, UpdateStatus } from '@/components/common/ContentUpdateNotification';
import { storageManager } from '@/services/storageManager';
const DEFAULT_CONFIG = {
    checkInterval: 30 * 60 * 1000,
    autoCheck: true,
    autoDownload: false,
    updateServerUrl: '/api/updates',
    maxRetries: 3,
};
const MOCK_UPDATES = [
    {
        id: 'vocab-update-001',
        type: UpdateType.VOCABULARY,
        title: '新增100个DeFi词汇',
        description: '本次更新新增了100个最新的DeFi领域专业词汇，包括流动性挖矿、收益农场等热门概念。',
        version: '1.2.0',
        size: 2048000,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
        size: 1536000,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
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
export const useContentUpdate = (config = {}) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const toast = useToast();
    const [state, setState] = useState({
        availableUpdates: [],
        currentUpdate: null,
        status: UpdateStatus.AVAILABLE,
        progress: 0,
        isChecking: false,
        error: null,
        lastCheckTime: null,
        ignoredUpdates: [],
    });
    const checkIntervalRef = useRef(null);
    const retryCountRef = useRef(0);
    const abortControllerRef = useRef(null);
    const checkForUpdates = useCallback(async (showToast = false) => {
        setState(prev => ({ ...prev, isChecking: true, error: null }));
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const updates = MOCK_UPDATES.filter(update => {
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
        }
        catch (error) {
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
    const startUpdate = useCallback(async (updateInfo) => {
        setState(prev => ({
            ...prev,
            currentUpdate: updateInfo,
            status: UpdateStatus.DOWNLOADING,
            progress: 0,
            error: null,
        }));
        try {
            abortControllerRef.current = new AbortController();
            for (let i = 0; i <= 100; i += 10) {
                if (abortControllerRef.current.signal.aborted) {
                    throw new Error('Download cancelled');
                }
                setState(prev => ({ ...prev, progress: i }));
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            setState(prev => ({ ...prev, status: UpdateStatus.READY }));
            toast({
                title: '下载完成',
                description: '更新已下载完成，点击应用更新',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        catch (error) {
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
    const applyUpdate = useCallback(async () => {
        if (!state.currentUpdate)
            return;
        setState(prev => ({ ...prev, status: UpdateStatus.INSTALLING, progress: 0 }));
        try {
            for (let i = 0; i <= 100; i += 20) {
                setState(prev => ({ ...prev, progress: i }));
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            switch (state.currentUpdate.type) {
                case UpdateType.VOCABULARY:
                    await updateVocabularyData(state.currentUpdate);
                    break;
                case UpdateType.CONTENT:
                    await updateContentData(state.currentUpdate);
                    break;
                case UpdateType.FEATURE:
                    await updateFeatures(state.currentUpdate);
                    break;
                case UpdateType.SYSTEM:
                    await updateSystem(state.currentUpdate);
                    break;
            }
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
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    status: UpdateStatus.AVAILABLE,
                    progress: 0,
                }));
            }, 3000);
        }
        catch (error) {
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
    const ignoreUpdate = useCallback(async (updateId) => {
        const newIgnoredUpdates = [...state.ignoredUpdates, updateId];
        setState(prev => ({
            ...prev,
            ignoredUpdates: newIgnoredUpdates,
            availableUpdates: prev.availableUpdates.filter(u => u.id !== updateId),
        }));
        try {
            await storageManager.setItem('ignored_updates', newIgnoredUpdates);
        }
        catch (error) {
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
    const resetUpdateState = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentUpdate: null,
            status: UpdateStatus.AVAILABLE,
            progress: 0,
            error: null,
        }));
    }, []);
    const updateVocabularyData = async (updateInfo) => {
        console.log('Updating vocabulary data:', updateInfo);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };
    const updateContentData = async (updateInfo) => {
        console.log('Updating content data:', updateInfo);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };
    const updateFeatures = async (updateInfo) => {
        console.log('Updating features:', updateInfo);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };
    const updateSystem = async (updateInfo) => {
        console.log('Updating system:', updateInfo);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };
    useEffect(() => {
        const loadIgnoredUpdates = async () => {
            try {
                const ignored = await storageManager.getItem('ignored_updates', []);
                setState(prev => ({ ...prev, ignoredUpdates: ignored }));
            }
            catch (error) {
                console.error('Failed to load ignored updates:', error);
            }
        };
        loadIgnoredUpdates();
        if (finalConfig.autoCheck) {
            checkForUpdates();
        }
    }, [finalConfig.autoCheck, checkForUpdates]);
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
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    return {
        ...state,
        checkForUpdates,
        startUpdate,
        cancelUpdate,
        applyUpdate,
        ignoreUpdate,
        resetUpdateState,
        hasUpdates: state.availableUpdates.length > 0,
        isUpdating: state.status === UpdateStatus.DOWNLOADING || state.status === UpdateStatus.INSTALLING,
    };
};
