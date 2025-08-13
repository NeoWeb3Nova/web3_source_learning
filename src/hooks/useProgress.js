import { useCallback, useEffect } from 'react';
import { useProgressContext, ProgressActionType, } from '@/contexts/ProgressContext';
import { AchievementType, AchievementStatus, } from '@/types';
import { storageService, StorageKey } from '@/services/storage';
export const useProgress = () => {
    const { state, dispatch } = useProgressContext();
    const initializeProgress = useCallback(async () => {
        dispatch({ type: ProgressActionType.SET_LOADING, payload: true });
        try {
            const savedProgress = storageService.getItem(StorageKey.USER_PROGRESS);
            const savedGoals = storageService.getItem(StorageKey.LEARNING_GOALS);
            if (savedProgress) {
                dispatch({ type: ProgressActionType.SET_USER_PROGRESS, payload: savedProgress });
            }
            else {
                const defaultProgress = createDefaultUserProgress();
                dispatch({ type: ProgressActionType.SET_USER_PROGRESS, payload: defaultProgress });
            }
            if (savedGoals) {
                dispatch({ type: ProgressActionType.SET_GOALS, payload: savedGoals });
            }
            dispatch({ type: ProgressActionType.INITIALIZE });
        }
        catch (error) {
            console.error('Failed to initialize progress:', error);
            dispatch({ type: ProgressActionType.SET_ERROR, payload: '初始化进度数据失败' });
        }
    }, [dispatch]);
    const createDefaultUserProgress = useCallback(() => {
        const now = new Date();
        return {
            userId: `user_${Date.now()}`,
            dailyStats: [],
            streakDays: 0,
            maxStreakDays: 0,
            totalStudyTime: 0,
            masteredWords: [],
            weakWords: [],
            favoriteWords: [],
            achievements: createDefaultAchievements(),
            totalPoints: 0,
            level: 1,
            currentLevelExp: 0,
            nextLevelExp: 100,
            studySessions: [],
            createdAt: now,
            updatedAt: now,
        };
    }, []);
    const createDefaultAchievements = useCallback(() => {
        return [
            {
                id: 'first_word',
                name: '初学者',
                description: '学习第一个单词',
                icon: '🌱',
                type: AchievementType.WORDS_MASTERED,
                progress: 0,
                target: 1,
                status: AchievementStatus.LOCKED,
                rewardPoints: 10,
            },
            {
                id: 'ten_words',
                name: '词汇新手',
                description: '掌握10个单词',
                icon: '📚',
                type: AchievementType.WORDS_MASTERED,
                progress: 0,
                target: 10,
                status: AchievementStatus.LOCKED,
                rewardPoints: 50,
            },
            {
                id: 'fifty_words',
                name: '词汇达人',
                description: '掌握50个单词',
                icon: '🎓',
                type: AchievementType.WORDS_MASTERED,
                progress: 0,
                target: 50,
                status: AchievementStatus.LOCKED,
                rewardPoints: 200,
            },
            {
                id: 'hundred_words',
                name: '词汇专家',
                description: '掌握100个单词',
                icon: '🏆',
                type: AchievementType.WORDS_MASTERED,
                progress: 0,
                target: 100,
                status: AchievementStatus.LOCKED,
                rewardPoints: 500,
            },
            {
                id: 'seven_day_streak',
                name: '坚持不懈',
                description: '连续学习7天',
                icon: '🔥',
                type: AchievementType.STUDY_STREAK,
                progress: 0,
                target: 7,
                status: AchievementStatus.LOCKED,
                rewardPoints: 100,
            },
            {
                id: 'thirty_day_streak',
                name: '学习达人',
                description: '连续学习30天',
                icon: '⭐',
                type: AchievementType.STUDY_STREAK,
                progress: 0,
                target: 30,
                status: AchievementStatus.LOCKED,
                rewardPoints: 1000,
            },
            {
                id: 'high_accuracy',
                name: '精准射手',
                description: '练习正确率达到90%',
                icon: '🎯',
                type: AchievementType.ACCURACY_RATE,
                progress: 0,
                target: 90,
                status: AchievementStatus.LOCKED,
                rewardPoints: 300,
            },
            {
                id: 'study_time_10h',
                name: '时间管理者',
                description: '累计学习10小时',
                icon: '⏰',
                type: AchievementType.STUDY_TIME,
                progress: 0,
                target: 600,
                status: AchievementStatus.LOCKED,
                rewardPoints: 400,
            },
        ];
    }, []);
    const saveProgressData = useCallback(() => {
        try {
            if (state.userProgress) {
                storageService.setItem(StorageKey.USER_PROGRESS, state.userProgress);
            }
            storageService.setItem(StorageKey.LEARNING_GOALS, state.goals);
        }
        catch (error) {
            console.error('Failed to save progress data:', error);
        }
    }, [state.userProgress, state.goals]);
    const updateDailyStats = useCallback((updates) => {
        dispatch({ type: ProgressActionType.UPDATE_DAILY_STATS, payload: updates });
    }, [dispatch]);
    const startStudySession = useCallback((sessionType) => {
        const session = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: new Date(),
            wordsStudied: [],
            sessionType,
        };
        dispatch({ type: ProgressActionType.START_STUDY_SESSION, payload: session });
        return session.id;
    }, [dispatch]);
    const endStudySession = useCallback((wordsStudied = []) => {
        const endTime = new Date();
        dispatch({
            type: ProgressActionType.END_STUDY_SESSION,
            payload: { endTime, wordsStudied }
        });
        const studyTimeMinutes = state.currentSession
            ? Math.floor((endTime.getTime() - state.currentSession.startTime.getTime()) / 60000)
            : 0;
        updateDailyStats({
            wordsStudied: wordsStudied.length,
            studyTimeMinutes,
            practiceSessions: state.currentSession?.sessionType === 'practice' ? 1 : 0,
        });
    }, [dispatch, state.currentSession, updateDailyStats]);
    const updateStreak = useCallback(() => {
        if (!state.userProgress)
            return;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const todayStats = state.userProgress.dailyStats.find(stats => stats.date === today);
        const yesterdayStats = state.userProgress.dailyStats.find(stats => stats.date === yesterday);
        let newStreak = state.userProgress.streakDays;
        if (todayStats && todayStats.wordsStudied > 0) {
            if (state.userProgress.streakDays === 0 || yesterdayStats) {
                newStreak = state.userProgress.streakDays + 1;
            }
        }
        else if (!yesterdayStats && state.userProgress.streakDays > 0) {
            newStreak = 0;
        }
        if (newStreak !== state.userProgress.streakDays) {
            dispatch({ type: ProgressActionType.UPDATE_STREAK, payload: newStreak });
        }
    }, [state.userProgress, dispatch]);
    const addMasteredWord = useCallback((wordId) => {
        dispatch({ type: ProgressActionType.ADD_MASTERED_WORD, payload: wordId });
        updateDailyStats({ newMasteredWords: 1 });
        checkWordMasteryAchievements();
    }, [dispatch, updateDailyStats]);
    const removeMasteredWord = useCallback((wordId) => {
        dispatch({ type: ProgressActionType.REMOVE_MASTERED_WORD, payload: wordId });
    }, [dispatch]);
    const addWeakWord = useCallback((wordId) => {
        dispatch({ type: ProgressActionType.ADD_WEAK_WORD, payload: wordId });
    }, [dispatch]);
    const removeWeakWord = useCallback((wordId) => {
        dispatch({ type: ProgressActionType.REMOVE_WEAK_WORD, payload: wordId });
    }, [dispatch]);
    const unlockAchievement = useCallback((achievementId) => {
        dispatch({ type: ProgressActionType.UNLOCK_ACHIEVEMENT, payload: achievementId });
    }, [dispatch]);
    const updateAchievementProgress = useCallback((achievementId, progress) => {
        dispatch({
            type: ProgressActionType.UPDATE_ACHIEVEMENT_PROGRESS,
            payload: { id: achievementId, progress }
        });
    }, [dispatch]);
    const addPoints = useCallback((points) => {
        dispatch({ type: ProgressActionType.ADD_POINTS, payload: points });
    }, [dispatch]);
    const checkWordMasteryAchievements = useCallback(() => {
        if (!state.userProgress)
            return;
        const masteredCount = state.userProgress.masteredWords.length;
        const wordAchievements = state.userProgress.achievements.filter(a => a.type === AchievementType.WORDS_MASTERED);
        wordAchievements.forEach(achievement => {
            if (achievement.status === AchievementStatus.LOCKED && masteredCount >= achievement.target) {
                unlockAchievement(achievement.id);
            }
            else if (achievement.status !== AchievementStatus.UNLOCKED) {
                updateAchievementProgress(achievement.id, masteredCount);
            }
        });
    }, [state.userProgress, unlockAchievement, updateAchievementProgress]);
    const checkStreakAchievements = useCallback(() => {
        if (!state.userProgress)
            return;
        const streakDays = state.userProgress.streakDays;
        const streakAchievements = state.userProgress.achievements.filter(a => a.type === AchievementType.STUDY_STREAK);
        streakAchievements.forEach(achievement => {
            if (achievement.status === AchievementStatus.LOCKED && streakDays >= achievement.target) {
                unlockAchievement(achievement.id);
            }
            else if (achievement.status !== AchievementStatus.UNLOCKED) {
                updateAchievementProgress(achievement.id, streakDays);
            }
        });
    }, [state.userProgress, unlockAchievement, updateAchievementProgress]);
    const addLearningGoal = useCallback((goal) => {
        const newGoal = {
            ...goal,
            id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        };
        dispatch({ type: ProgressActionType.ADD_GOAL, payload: newGoal });
        return newGoal;
    }, [dispatch]);
    const updateLearningGoal = useCallback((goal) => {
        dispatch({ type: ProgressActionType.UPDATE_GOAL, payload: goal });
    }, [dispatch]);
    const completeLearningGoal = useCallback((goalId) => {
        dispatch({ type: ProgressActionType.COMPLETE_GOAL, payload: goalId });
    }, [dispatch]);
    const deleteLearningGoal = useCallback((goalId) => {
        dispatch({ type: ProgressActionType.DELETE_GOAL, payload: goalId });
    }, [dispatch]);
    const resetProgress = useCallback(() => {
        dispatch({ type: ProgressActionType.RESET_PROGRESS });
    }, [dispatch]);
    const getTodayStats = useCallback(() => {
        if (!state.userProgress)
            return null;
        const today = new Date().toISOString().split('T')[0];
        return state.userProgress.dailyStats.find(stats => stats.date === today) || null;
    }, [state.userProgress]);
    const getWeekStats = useCallback(() => {
        if (!state.userProgress)
            return null;
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekStats = state.userProgress.dailyStats.filter(stats => stats.date >= weekStartStr);
        return weekStats.reduce((acc, stats) => ({
            totalWords: acc.totalWords + stats.wordsStudied,
            totalTime: acc.totalTime + stats.studyTimeMinutes,
            totalCorrect: acc.totalCorrect + stats.correctAnswers,
            totalAnswers: acc.totalAnswers + stats.totalAnswers,
            sessionsCount: acc.sessionsCount + stats.practiceSessions,
        }), { totalWords: 0, totalTime: 0, totalCorrect: 0, totalAnswers: 0, sessionsCount: 0 });
    }, [state.userProgress]);
    useEffect(() => {
        if (state.initialized) {
            saveProgressData();
        }
    }, [state.userProgress, state.goals, state.initialized, saveProgressData]);
    useEffect(() => {
        if (state.userProgress) {
            checkWordMasteryAchievements();
            checkStreakAchievements();
        }
    }, [state.userProgress?.masteredWords.length, state.userProgress?.streakDays]);
    return {
        userProgress: state.userProgress,
        summary: state.summary,
        goals: state.goals,
        currentSession: state.currentSession,
        loading: state.loading,
        error: state.error,
        initialized: state.initialized,
        initializeProgress,
        updateDailyStats,
        startStudySession,
        endStudySession,
        updateStreak,
        addMasteredWord,
        removeMasteredWord,
        addWeakWord,
        removeWeakWord,
        unlockAchievement,
        updateAchievementProgress,
        addPoints,
        addLearningGoal,
        updateLearningGoal,
        completeLearningGoal,
        deleteLearningGoal,
        resetProgress,
        getTodayStats,
        getWeekStats,
    };
};
