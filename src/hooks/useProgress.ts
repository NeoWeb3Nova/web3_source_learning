import { useCallback, useEffect } from 'react';
import {
  useProgressContext,
  ProgressActionType,
} from '@/contexts/ProgressContext';
import {
  UserProgress,
  DailyStats,
  Achievement,
  StudySession,
  LearningGoal,
  AchievementType,
  AchievementStatus,
} from '@/types';
import { storageService, StorageKey } from '@/services/storage';

/**
 * 进度管理Hook
 */
export const useProgress = () => {
  const { state, dispatch } = useProgressContext();

  /**
   * 初始化进度数据
   */
  const initializeProgress = useCallback(async () => {
    dispatch({ type: ProgressActionType.SET_LOADING, payload: true });

    try {
      // 从本地存储加载进度数据
      const savedProgress = storageService.getItem<UserProgress>(StorageKey.USER_PROGRESS);
      const savedGoals = storageService.getItem<LearningGoal[]>(StorageKey.LEARNING_GOALS);

      if (savedProgress) {
        dispatch({ type: ProgressActionType.SET_USER_PROGRESS, payload: savedProgress });
      } else {
        // 创建默认用户进度
        const defaultProgress = createDefaultUserProgress();
        dispatch({ type: ProgressActionType.SET_USER_PROGRESS, payload: defaultProgress });
      }

      if (savedGoals) {
        dispatch({ type: ProgressActionType.SET_GOALS, payload: savedGoals });
      }

      dispatch({ type: ProgressActionType.INITIALIZE });
    } catch (error) {
      console.error('Failed to initialize progress:', error);
      dispatch({ type: ProgressActionType.SET_ERROR, payload: '初始化进度数据失败' });
    }
  }, [dispatch]);

  /**
   * 创建默认用户进度
   */
  const createDefaultUserProgress = useCallback((): UserProgress => {
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

  /**
   * 创建默认成就列表
   */
  const createDefaultAchievements = useCallback((): Achievement[] => {
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
        target: 600, // 10小时 = 600分钟
        status: AchievementStatus.LOCKED,
        rewardPoints: 400,
      },
    ];
  }, []);

  /**
   * 保存进度数据到本地存储
   */
  const saveProgressData = useCallback(() => {
    try {
      if (state.userProgress) {
        storageService.setItem(StorageKey.USER_PROGRESS, state.userProgress);
      }
      storageService.setItem(StorageKey.LEARNING_GOALS, state.goals);
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }, [state.userProgress, state.goals]);

  /**
   * 更新每日统计
   */
  const updateDailyStats = useCallback((updates: Partial<DailyStats>) => {
    dispatch({ type: ProgressActionType.UPDATE_DAILY_STATS, payload: updates });
  }, [dispatch]);

  /**
   * 开始学习会话
   */
  const startStudySession = useCallback((sessionType: 'vocabulary' | 'practice') => {
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      wordsStudied: [],
      sessionType,
    };

    dispatch({ type: ProgressActionType.START_STUDY_SESSION, payload: session });
    return session.id;
  }, [dispatch]);

  /**
   * 结束学习会话
   */
  const endStudySession = useCallback((wordsStudied: string[] = []) => {
    const endTime = new Date();
    dispatch({ 
      type: ProgressActionType.END_STUDY_SESSION, 
      payload: { endTime, wordsStudied } 
    });

    // 更新每日统计
    const studyTimeMinutes = state.currentSession 
      ? Math.floor((endTime.getTime() - state.currentSession.startTime.getTime()) / 60000)
      : 0;

    updateDailyStats({
      wordsStudied: wordsStudied.length,
      studyTimeMinutes,
      practiceSessions: state.currentSession?.sessionType === 'practice' ? 1 : 0,
    });
  }, [dispatch, state.currentSession, updateDailyStats]);

  /**
   * 更新连续学习天数
   */
  const updateStreak = useCallback(() => {
    if (!state.userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todayStats = state.userProgress.dailyStats.find(stats => stats.date === today);
    const yesterdayStats = state.userProgress.dailyStats.find(stats => stats.date === yesterday);

    let newStreak = state.userProgress.streakDays;

    if (todayStats && todayStats.wordsStudied > 0) {
      // 今天有学习记录
      if (state.userProgress.streakDays === 0 || yesterdayStats) {
        // 如果是第一天学习或者昨天也有学习记录，增加连续天数
        newStreak = state.userProgress.streakDays + 1;
      }
    } else if (!yesterdayStats && state.userProgress.streakDays > 0) {
      // 昨天没有学习记录，重置连续天数
      newStreak = 0;
    }

    if (newStreak !== state.userProgress.streakDays) {
      dispatch({ type: ProgressActionType.UPDATE_STREAK, payload: newStreak });
    }
  }, [state.userProgress, dispatch]);

  /**
   * 添加掌握的单词
   */
  const addMasteredWord = useCallback((wordId: string) => {
    dispatch({ type: ProgressActionType.ADD_MASTERED_WORD, payload: wordId });
    
    // 更新每日统计
    updateDailyStats({ newMasteredWords: 1 });
    
    // 检查相关成就
    checkWordMasteryAchievements();
  }, [dispatch, updateDailyStats]);

  /**
   * 移除掌握的单词
   */
  const removeMasteredWord = useCallback((wordId: string) => {
    dispatch({ type: ProgressActionType.REMOVE_MASTERED_WORD, payload: wordId });
  }, [dispatch]);

  /**
   * 添加薄弱单词
   */
  const addWeakWord = useCallback((wordId: string) => {
    dispatch({ type: ProgressActionType.ADD_WEAK_WORD, payload: wordId });
  }, [dispatch]);

  /**
   * 移除薄弱单词
   */
  const removeWeakWord = useCallback((wordId: string) => {
    dispatch({ type: ProgressActionType.REMOVE_WEAK_WORD, payload: wordId });
  }, [dispatch]);

  /**
   * 解锁成就
   */
  const unlockAchievement = useCallback((achievementId: string) => {
    dispatch({ type: ProgressActionType.UNLOCK_ACHIEVEMENT, payload: achievementId });
  }, [dispatch]);

  /**
   * 更新成就进度
   */
  const updateAchievementProgress = useCallback((achievementId: string, progress: number) => {
    dispatch({ 
      type: ProgressActionType.UPDATE_ACHIEVEMENT_PROGRESS, 
      payload: { id: achievementId, progress } 
    });
  }, [dispatch]);

  /**
   * 添加积分
   */
  const addPoints = useCallback((points: number) => {
    dispatch({ type: ProgressActionType.ADD_POINTS, payload: points });
  }, [dispatch]);

  /**
   * 检查单词掌握相关成就
   */
  const checkWordMasteryAchievements = useCallback(() => {
    if (!state.userProgress) return;

    const masteredCount = state.userProgress.masteredWords.length;
    const wordAchievements = state.userProgress.achievements.filter(
      a => a.type === AchievementType.WORDS_MASTERED
    );

    wordAchievements.forEach(achievement => {
      if (achievement.status === AchievementStatus.LOCKED && masteredCount >= achievement.target) {
        unlockAchievement(achievement.id);
      } else if (achievement.status !== AchievementStatus.UNLOCKED) {
        updateAchievementProgress(achievement.id, masteredCount);
      }
    });
  }, [state.userProgress, unlockAchievement, updateAchievementProgress]);

  /**
   * 检查连续学习相关成就
   */
  const checkStreakAchievements = useCallback(() => {
    if (!state.userProgress) return;

    const streakDays = state.userProgress.streakDays;
    const streakAchievements = state.userProgress.achievements.filter(
      a => a.type === AchievementType.STUDY_STREAK
    );

    streakAchievements.forEach(achievement => {
      if (achievement.status === AchievementStatus.LOCKED && streakDays >= achievement.target) {
        unlockAchievement(achievement.id);
      } else if (achievement.status !== AchievementStatus.UNLOCKED) {
        updateAchievementProgress(achievement.id, streakDays);
      }
    });
  }, [state.userProgress, unlockAchievement, updateAchievementProgress]);

  /**
   * 添加学习目标
   */
  const addLearningGoal = useCallback((goal: Omit<LearningGoal, 'id' | 'createdAt'>) => {
    const newGoal: LearningGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    dispatch({ type: ProgressActionType.ADD_GOAL, payload: newGoal });
    return newGoal;
  }, [dispatch]);

  /**
   * 更新学习目标
   */
  const updateLearningGoal = useCallback((goal: LearningGoal) => {
    dispatch({ type: ProgressActionType.UPDATE_GOAL, payload: goal });
  }, [dispatch]);

  /**
   * 完成学习目标
   */
  const completeLearningGoal = useCallback((goalId: string) => {
    dispatch({ type: ProgressActionType.COMPLETE_GOAL, payload: goalId });
  }, [dispatch]);

  /**
   * 删除学习目标
   */
  const deleteLearningGoal = useCallback((goalId: string) => {
    dispatch({ type: ProgressActionType.DELETE_GOAL, payload: goalId });
  }, [dispatch]);

  /**
   * 重置进度
   */
  const resetProgress = useCallback(() => {
    dispatch({ type: ProgressActionType.RESET_PROGRESS });
  }, [dispatch]);

  /**
   * 获取今日统计
   */
  const getTodayStats = useCallback((): DailyStats | null => {
    if (!state.userProgress) return null;

    const today = new Date().toISOString().split('T')[0];
    return state.userProgress.dailyStats.find(stats => stats.date === today) || null;
  }, [state.userProgress]);

  /**
   * 获取本周统计
   */
  const getWeekStats = useCallback(() => {
    if (!state.userProgress) return null;

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const weekStats = state.userProgress.dailyStats.filter(
      stats => stats.date >= weekStartStr
    );

    return weekStats.reduce(
      (acc, stats) => ({
        totalWords: acc.totalWords + stats.wordsStudied,
        totalTime: acc.totalTime + stats.studyTimeMinutes,
        totalCorrect: acc.totalCorrect + stats.correctAnswers,
        totalAnswers: acc.totalAnswers + stats.totalAnswers,
        sessionsCount: acc.sessionsCount + stats.practiceSessions,
      }),
      { totalWords: 0, totalTime: 0, totalCorrect: 0, totalAnswers: 0, sessionsCount: 0 }
    );
  }, [state.userProgress]);

  // 自动保存数据
  useEffect(() => {
    if (state.initialized) {
      saveProgressData();
    }
  }, [state.userProgress, state.goals, state.initialized, saveProgressData]);

  // 检查成就
  useEffect(() => {
    if (state.userProgress) {
      checkWordMasteryAchievements();
      checkStreakAchievements();
    }
  }, [state.userProgress?.masteredWords.length, state.userProgress?.streakDays]);

  return {
    // 状态
    userProgress: state.userProgress,
    summary: state.summary,
    goals: state.goals,
    currentSession: state.currentSession,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // 操作方法
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

    // 工具方法
    getTodayStats,
    getWeekStats,
  };
};