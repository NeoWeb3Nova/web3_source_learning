import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  UserProgress,
  DailyStats,
  Achievement,
  StudySession,
  ProgressSummary,
  LearningGoal,
  AchievementStatus,
  AchievementType,
} from '@/types';

/**
 * 进度状态接口
 */
export interface ProgressState {
  /** 用户进度数据 */
  userProgress: UserProgress | null;
  /** 进度摘要 */
  summary: ProgressSummary | null;
  /** 学习目标列表 */
  goals: LearningGoal[];
  /** 当前学习会话 */
  currentSession: StudySession | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 进度动作类型枚举
 */
export enum ProgressActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_USER_PROGRESS = 'SET_USER_PROGRESS',
  UPDATE_DAILY_STATS = 'UPDATE_DAILY_STATS',
  ADD_STUDY_SESSION = 'ADD_STUDY_SESSION',
  START_STUDY_SESSION = 'START_STUDY_SESSION',
  END_STUDY_SESSION = 'END_STUDY_SESSION',
  UPDATE_STREAK = 'UPDATE_STREAK',
  ADD_MASTERED_WORD = 'ADD_MASTERED_WORD',
  REMOVE_MASTERED_WORD = 'REMOVE_MASTERED_WORD',
  ADD_WEAK_WORD = 'ADD_WEAK_WORD',
  REMOVE_WEAK_WORD = 'REMOVE_WEAK_WORD',
  UNLOCK_ACHIEVEMENT = 'UNLOCK_ACHIEVEMENT',
  UPDATE_ACHIEVEMENT_PROGRESS = 'UPDATE_ACHIEVEMENT_PROGRESS',
  ADD_POINTS = 'ADD_POINTS',
  LEVEL_UP = 'LEVEL_UP',
  SET_SUMMARY = 'SET_SUMMARY',
  SET_GOALS = 'SET_GOALS',
  ADD_GOAL = 'ADD_GOAL',
  UPDATE_GOAL = 'UPDATE_GOAL',
  COMPLETE_GOAL = 'COMPLETE_GOAL',
  DELETE_GOAL = 'DELETE_GOAL',
  RESET_PROGRESS = 'RESET_PROGRESS',
  INITIALIZE = 'INITIALIZE',
}

/**
 * 进度动作接口
 */
export type ProgressAction =
  | { type: ProgressActionType.SET_LOADING; payload: boolean }
  | { type: ProgressActionType.SET_ERROR; payload: string | null }
  | { type: ProgressActionType.SET_USER_PROGRESS; payload: UserProgress }
  | { type: ProgressActionType.UPDATE_DAILY_STATS; payload: Partial<DailyStats> }
  | { type: ProgressActionType.ADD_STUDY_SESSION; payload: StudySession }
  | { type: ProgressActionType.START_STUDY_SESSION; payload: Omit<StudySession, 'endTime' | 'duration'> }
  | { type: ProgressActionType.END_STUDY_SESSION; payload: { endTime: Date; wordsStudied: string[] } }
  | { type: ProgressActionType.UPDATE_STREAK; payload: number }
  | { type: ProgressActionType.ADD_MASTERED_WORD; payload: string }
  | { type: ProgressActionType.REMOVE_MASTERED_WORD; payload: string }
  | { type: ProgressActionType.ADD_WEAK_WORD; payload: string }
  | { type: ProgressActionType.REMOVE_WEAK_WORD; payload: string }
  | { type: ProgressActionType.UNLOCK_ACHIEVEMENT; payload: string }
  | { type: ProgressActionType.UPDATE_ACHIEVEMENT_PROGRESS; payload: { id: string; progress: number } }
  | { type: ProgressActionType.ADD_POINTS; payload: number }
  | { type: ProgressActionType.LEVEL_UP; payload: { newLevel: number; newExp: number } }
  | { type: ProgressActionType.SET_SUMMARY; payload: ProgressSummary }
  | { type: ProgressActionType.SET_GOALS; payload: LearningGoal[] }
  | { type: ProgressActionType.ADD_GOAL; payload: LearningGoal }
  | { type: ProgressActionType.UPDATE_GOAL; payload: LearningGoal }
  | { type: ProgressActionType.COMPLETE_GOAL; payload: string }
  | { type: ProgressActionType.DELETE_GOAL; payload: string }
  | { type: ProgressActionType.RESET_PROGRESS }
  | { type: ProgressActionType.INITIALIZE };

/**
 * 初始状态
 */
const initialState: ProgressState = {
  userProgress: null,
  summary: null,
  goals: [],
  currentSession: null,
  loading: false,
  error: null,
  initialized: false,
};

/**
 * 获取今日日期字符串
 */
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 创建默认的每日统计
 */
const createDefaultDailyStats = (date: string): DailyStats => ({
  date,
  wordsStudied: 0,
  practiceSessions: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  studyTimeMinutes: 0,
  newMasteredWords: 0,
});

/**
 * 更新或创建每日统计
 */
const updateDailyStats = (
  dailyStats: DailyStats[],
  updates: Partial<DailyStats>
): DailyStats[] => {
  const today = getTodayDateString();
  const existingIndex = dailyStats.findIndex(stats => stats.date === today);

  if (existingIndex >= 0) {
    // 更新现有统计
    const updated = [...dailyStats];
    updated[existingIndex] = { ...updated[existingIndex], ...updates };
    return updated;
  } else {
    // 创建新的统计
    const newStats = { ...createDefaultDailyStats(today), ...updates };
    return [...dailyStats, newStats];
  }
};

/**
 * 计算经验值等级
 */
const calculateLevel = (totalExp: number): { level: number; currentLevelExp: number; nextLevelExp: number } => {
  // 每级所需经验值递增公式：level * 100
  let level = 1;
  let expForCurrentLevel = 0;
  let expForNextLevel = 100;

  while (totalExp >= expForNextLevel) {
    expForCurrentLevel = expForNextLevel;
    level++;
    expForNextLevel = level * 100;
  }

  return {
    level,
    currentLevelExp: totalExp - expForCurrentLevel,
    nextLevelExp: expForNextLevel - expForCurrentLevel,
  };
};

/**
 * 检查成就解锁条件
 */
const checkAchievementUnlock = (
  achievement: Achievement,
  userProgress: UserProgress
): boolean => {
  switch (achievement.type) {
    case AchievementType.STUDY_STREAK:
      return userProgress.streakDays >= achievement.target;
    
    case AchievementType.WORDS_MASTERED:
      return userProgress.masteredWords.length >= achievement.target;
    
    case AchievementType.PRACTICE_COUNT:
      return userProgress.studySessions.filter(s => s.sessionType === 'practice').length >= achievement.target;
    
    case AchievementType.ACCURACY_RATE:
      // 计算总体正确率
      const totalStats = userProgress.dailyStats.reduce(
        (acc, stats) => ({
          correct: acc.correct + stats.correctAnswers,
          total: acc.total + stats.totalAnswers,
        }),
        { correct: 0, total: 0 }
      );
      const accuracy = totalStats.total > 0 ? totalStats.correct / totalStats.total : 0;
      return accuracy >= achievement.target / 100;
    
    case AchievementType.STUDY_TIME:
      return userProgress.totalStudyTime >= achievement.target;
    
    default:
      return false;
  }
};

/**
 * 进度状态reducer
 */
export const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case ProgressActionType.SET_LOADING:
      return { ...state, loading: action.payload };

    case ProgressActionType.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ProgressActionType.SET_USER_PROGRESS:
      return {
        ...state,
        userProgress: action.payload,
        loading: false,
        error: null,
      };

    case ProgressActionType.UPDATE_DAILY_STATS: {
      if (!state.userProgress) return state;

      const updatedDailyStats = updateDailyStats(state.userProgress.dailyStats, action.payload);
      
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          dailyStats: updatedDailyStats,
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.ADD_STUDY_SESSION: {
      if (!state.userProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          studySessions: [...state.userProgress.studySessions, action.payload],
          lastStudyTime: action.payload.endTime,
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.START_STUDY_SESSION: {
      const session: StudySession = {
        ...action.payload,
        endTime: new Date(), // 临时值，结束时会更新
        duration: 0, // 临时值，结束时会计算
      };

      return {
        ...state,
        currentSession: session,
      };
    }

    case ProgressActionType.END_STUDY_SESSION: {
      if (!state.currentSession) return state;

      const { endTime, wordsStudied } = action.payload;
      const duration = Math.floor((endTime.getTime() - state.currentSession.startTime.getTime()) / 1000);
      
      const completedSession: StudySession = {
        ...state.currentSession,
        endTime,
        duration,
        wordsStudied,
      };

      const updatedState = {
        ...state,
        currentSession: null,
      };

      // 添加会话到历史记录
      if (state.userProgress) {
        updatedState.userProgress = {
          ...state.userProgress,
          studySessions: [...state.userProgress.studySessions, completedSession],
          totalStudyTime: state.userProgress.totalStudyTime + Math.floor(duration / 60),
          lastStudyTime: endTime,
          updatedAt: new Date(),
        };
      }

      return updatedState;
    }

    case ProgressActionType.UPDATE_STREAK: {
      if (!state.userProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          streakDays: action.payload,
          maxStreakDays: Math.max(state.userProgress.maxStreakDays, action.payload),
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.ADD_MASTERED_WORD: {
      if (!state.userProgress) return state;

      const wordId = action.payload;
      if (state.userProgress.masteredWords.includes(wordId)) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          masteredWords: [...state.userProgress.masteredWords, wordId],
          weakWords: state.userProgress.weakWords.filter(id => id !== wordId),
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.REMOVE_MASTERED_WORD: {
      if (!state.userProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          masteredWords: state.userProgress.masteredWords.filter(id => id !== action.payload),
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.ADD_WEAK_WORD: {
      if (!state.userProgress) return state;

      const wordId = action.payload;
      if (state.userProgress.weakWords.includes(wordId)) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          weakWords: [...state.userProgress.weakWords, wordId],
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.REMOVE_WEAK_WORD: {
      if (!state.userProgress) return state;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          weakWords: state.userProgress.weakWords.filter(id => id !== action.payload),
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.UNLOCK_ACHIEVEMENT: {
      if (!state.userProgress) return state;

      const achievementId = action.payload;
      const updatedAchievements = state.userProgress.achievements.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, status: AchievementStatus.UNLOCKED, unlockedAt: new Date() }
          : achievement
      );

      const unlockedAchievement = updatedAchievements.find(a => a.id === achievementId);
      const pointsToAdd = unlockedAchievement?.rewardPoints || 0;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          achievements: updatedAchievements,
          totalPoints: state.userProgress.totalPoints + pointsToAdd,
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.UPDATE_ACHIEVEMENT_PROGRESS: {
      if (!state.userProgress) return state;

      const { id, progress } = action.payload;
      const updatedAchievements = state.userProgress.achievements.map(achievement => {
        if (achievement.id === id) {
          const newProgress = Math.min(progress, achievement.target);
          const newStatus = newProgress >= achievement.target 
            ? AchievementStatus.UNLOCKED 
            : newProgress > 0 
              ? AchievementStatus.IN_PROGRESS 
              : AchievementStatus.LOCKED;

          return {
            ...achievement,
            progress: newProgress,
            status: newStatus,
            unlockedAt: newStatus === AchievementStatus.UNLOCKED ? new Date() : achievement.unlockedAt,
          };
        }
        return achievement;
      });

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          achievements: updatedAchievements,
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.ADD_POINTS: {
      if (!state.userProgress) return state;

      const newTotalPoints = state.userProgress.totalPoints + action.payload;
      const levelInfo = calculateLevel(newTotalPoints);

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          totalPoints: newTotalPoints,
          level: levelInfo.level,
          currentLevelExp: levelInfo.currentLevelExp,
          nextLevelExp: levelInfo.nextLevelExp,
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.LEVEL_UP: {
      if (!state.userProgress) return state;

      const { newLevel, newExp } = action.payload;

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          level: newLevel,
          currentLevelExp: newExp,
          updatedAt: new Date(),
        },
      };
    }

    case ProgressActionType.SET_SUMMARY:
      return { ...state, summary: action.payload };

    case ProgressActionType.SET_GOALS:
      return { ...state, goals: action.payload };

    case ProgressActionType.ADD_GOAL:
      return { ...state, goals: [...state.goals, action.payload] };

    case ProgressActionType.UPDATE_GOAL: {
      const updatedGoals = state.goals.map(goal =>
        goal.id === action.payload.id ? action.payload : goal
      );
      return { ...state, goals: updatedGoals };
    }

    case ProgressActionType.COMPLETE_GOAL: {
      const updatedGoals = state.goals.map(goal =>
        goal.id === action.payload ? { ...goal, completed: true } : goal
      );
      return { ...state, goals: updatedGoals };
    }

    case ProgressActionType.DELETE_GOAL: {
      const filteredGoals = state.goals.filter(goal => goal.id !== action.payload);
      return { ...state, goals: filteredGoals };
    }

    case ProgressActionType.INITIALIZE:
      return { ...state, initialized: true };

    case ProgressActionType.RESET_PROGRESS:
      return { ...initialState };

    default:
      return state;
  }
};

/**
 * 进度上下文接口
 */
export interface ProgressContextType {
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
}

/**
 * 进度上下文
 */
export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

/**
 * 进度提供者组件Props
 */
interface ProgressProviderProps {
  children: ReactNode;
}

/**
 * 进度提供者组件
 */
export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  return (
    <ProgressContext.Provider value={{ state, dispatch }}>
      {children}
    </ProgressContext.Provider>
  );
};

/**
 * 使用进度上下文的Hook
 */
export const useProgressContext = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgressContext must be used within a ProgressProvider');
  }
  return context;
};