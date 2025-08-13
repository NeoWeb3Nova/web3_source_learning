import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer } from 'react';
import { AchievementStatus, AchievementType, } from '@/types';
export var ProgressActionType;
(function (ProgressActionType) {
    ProgressActionType["SET_LOADING"] = "SET_LOADING";
    ProgressActionType["SET_ERROR"] = "SET_ERROR";
    ProgressActionType["SET_USER_PROGRESS"] = "SET_USER_PROGRESS";
    ProgressActionType["UPDATE_DAILY_STATS"] = "UPDATE_DAILY_STATS";
    ProgressActionType["ADD_STUDY_SESSION"] = "ADD_STUDY_SESSION";
    ProgressActionType["START_STUDY_SESSION"] = "START_STUDY_SESSION";
    ProgressActionType["END_STUDY_SESSION"] = "END_STUDY_SESSION";
    ProgressActionType["UPDATE_STREAK"] = "UPDATE_STREAK";
    ProgressActionType["ADD_MASTERED_WORD"] = "ADD_MASTERED_WORD";
    ProgressActionType["REMOVE_MASTERED_WORD"] = "REMOVE_MASTERED_WORD";
    ProgressActionType["ADD_WEAK_WORD"] = "ADD_WEAK_WORD";
    ProgressActionType["REMOVE_WEAK_WORD"] = "REMOVE_WEAK_WORD";
    ProgressActionType["UNLOCK_ACHIEVEMENT"] = "UNLOCK_ACHIEVEMENT";
    ProgressActionType["UPDATE_ACHIEVEMENT_PROGRESS"] = "UPDATE_ACHIEVEMENT_PROGRESS";
    ProgressActionType["ADD_POINTS"] = "ADD_POINTS";
    ProgressActionType["LEVEL_UP"] = "LEVEL_UP";
    ProgressActionType["SET_SUMMARY"] = "SET_SUMMARY";
    ProgressActionType["SET_GOALS"] = "SET_GOALS";
    ProgressActionType["ADD_GOAL"] = "ADD_GOAL";
    ProgressActionType["UPDATE_GOAL"] = "UPDATE_GOAL";
    ProgressActionType["COMPLETE_GOAL"] = "COMPLETE_GOAL";
    ProgressActionType["DELETE_GOAL"] = "DELETE_GOAL";
    ProgressActionType["RESET_PROGRESS"] = "RESET_PROGRESS";
    ProgressActionType["INITIALIZE"] = "INITIALIZE";
})(ProgressActionType || (ProgressActionType = {}));
const initialState = {
    userProgress: null,
    summary: null,
    goals: [],
    currentSession: null,
    loading: false,
    error: null,
    initialized: false,
};
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};
const createDefaultDailyStats = (date) => ({
    date,
    wordsStudied: 0,
    practiceSessions: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    studyTimeMinutes: 0,
    newMasteredWords: 0,
});
const updateDailyStats = (dailyStats, updates) => {
    const today = getTodayDateString();
    const existingIndex = dailyStats.findIndex(stats => stats.date === today);
    if (existingIndex >= 0) {
        const updated = [...dailyStats];
        updated[existingIndex] = { ...updated[existingIndex], ...updates };
        return updated;
    }
    else {
        const newStats = { ...createDefaultDailyStats(today), ...updates };
        return [...dailyStats, newStats];
    }
};
const calculateLevel = (totalExp) => {
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
const checkAchievementUnlock = (achievement, userProgress) => {
    switch (achievement.type) {
        case AchievementType.STUDY_STREAK:
            return userProgress.streakDays >= achievement.target;
        case AchievementType.WORDS_MASTERED:
            return userProgress.masteredWords.length >= achievement.target;
        case AchievementType.PRACTICE_COUNT:
            return userProgress.studySessions.filter(s => s.sessionType === 'practice').length >= achievement.target;
        case AchievementType.ACCURACY_RATE:
            const totalStats = userProgress.dailyStats.reduce((acc, stats) => ({
                correct: acc.correct + stats.correctAnswers,
                total: acc.total + stats.totalAnswers,
            }), { correct: 0, total: 0 });
            const accuracy = totalStats.total > 0 ? totalStats.correct / totalStats.total : 0;
            return accuracy >= achievement.target / 100;
        case AchievementType.STUDY_TIME:
            return userProgress.totalStudyTime >= achievement.target;
        default:
            return false;
    }
};
export const progressReducer = (state, action) => {
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
            if (!state.userProgress)
                return state;
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
            if (!state.userProgress)
                return state;
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
            const session = {
                ...action.payload,
                endTime: new Date(),
                duration: 0,
            };
            return {
                ...state,
                currentSession: session,
            };
        }
        case ProgressActionType.END_STUDY_SESSION: {
            if (!state.currentSession)
                return state;
            const { endTime, wordsStudied } = action.payload;
            const duration = Math.floor((endTime.getTime() - state.currentSession.startTime.getTime()) / 1000);
            const completedSession = {
                ...state.currentSession,
                endTime,
                duration,
                wordsStudied,
            };
            const updatedState = {
                ...state,
                currentSession: null,
            };
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
            if (!state.userProgress)
                return state;
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
            if (!state.userProgress)
                return state;
            const wordId = action.payload;
            if (state.userProgress.masteredWords.includes(wordId))
                return state;
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
            if (!state.userProgress)
                return state;
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
            if (!state.userProgress)
                return state;
            const wordId = action.payload;
            if (state.userProgress.weakWords.includes(wordId))
                return state;
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
            if (!state.userProgress)
                return state;
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
            if (!state.userProgress)
                return state;
            const achievementId = action.payload;
            const updatedAchievements = state.userProgress.achievements.map(achievement => achievement.id === achievementId
                ? { ...achievement, status: AchievementStatus.UNLOCKED, unlockedAt: new Date() }
                : achievement);
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
            if (!state.userProgress)
                return state;
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
            if (!state.userProgress)
                return state;
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
            if (!state.userProgress)
                return state;
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
            const updatedGoals = state.goals.map(goal => goal.id === action.payload.id ? action.payload : goal);
            return { ...state, goals: updatedGoals };
        }
        case ProgressActionType.COMPLETE_GOAL: {
            const updatedGoals = state.goals.map(goal => goal.id === action.payload ? { ...goal, completed: true } : goal);
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
export const ProgressContext = createContext(undefined);
export const ProgressProvider = ({ children }) => {
    const [state, dispatch] = useReducer(progressReducer, initialState);
    return (_jsx(ProgressContext.Provider, { value: { state, dispatch }, children: children }));
};
export const useProgressContext = () => {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('useProgressContext must be used within a ProgressProvider');
    }
    return context;
};
