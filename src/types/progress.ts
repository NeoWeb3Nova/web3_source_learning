/**
 * 每日学习统计
 */
export interface DailyStats {
  /** 日期 (YYYY-MM-DD格式) */
  date: string;
  /** 学习的单词数量 */
  wordsStudied: number;
  /** 练习会话数量 */
  practiceSessions: number;
  /** 正确答案数量 */
  correctAnswers: number;
  /** 总答案数量 */
  totalAnswers: number;
  /** 学习时间（分钟） */
  studyTimeMinutes: number;
  /** 新掌握的单词数量 */
  newMasteredWords: number;
}

/**
 * 成就类型枚举
 */
export enum AchievementType {
  STUDY_STREAK = 'study_streak',
  WORDS_MASTERED = 'words_mastered',
  PRACTICE_COUNT = 'practice_count',
  ACCURACY_RATE = 'accuracy_rate',
  STUDY_TIME = 'study_time',
  CATEGORY_MASTER = 'category_master',
}

/**
 * 成就状态枚举
 */
export enum AchievementStatus {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  UNLOCKED = 'unlocked',
}

/**
 * 成就接口
 */
export interface Achievement {
  /** 成就ID */
  id: string;
  /** 成就名称 */
  name: string;
  /** 成就描述 */
  description: string;
  /** 成就图标 */
  icon: string;
  /** 成就类型 */
  type: AchievementType;
  /** 解锁时间 */
  unlockedAt?: Date;
  /** 当前进度 */
  progress: number;
  /** 目标值 */
  target: number;
  /** 成就状态 */
  status: AchievementStatus;
  /** 奖励积分 */
  rewardPoints: number;
}

/**
 * 学习会话记录
 */
export interface StudySession {
  /** 会话ID */
  id: string;
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime: Date;
  /** 学习的单词列表 */
  wordsStudied: string[];
  /** 会话类型 */
  sessionType: 'vocabulary' | 'practice';
  /** 持续时间（秒） */
  duration: number;
}

/**
 * 用户进度接口
 */
export interface UserProgress {
  /** 用户ID */
  userId: string;
  /** 每日统计数据 */
  dailyStats: DailyStats[];
  /** 连续学习天数 */
  streakDays: number;
  /** 最长连续学习天数 */
  maxStreakDays: number;
  /** 总学习时间（分钟） */
  totalStudyTime: number;
  /** 已掌握的单词ID列表 */
  masteredWords: string[];
  /** 薄弱单词ID列表 */
  weakWords: string[];
  /** 收藏的单词ID列表 */
  favoriteWords: string[];
  /** 成就列表 */
  achievements: Achievement[];
  /** 总积分 */
  totalPoints: number;
  /** 当前等级 */
  level: number;
  /** 当前等级经验值 */
  currentLevelExp: number;
  /** 升级所需经验值 */
  nextLevelExp: number;
  /** 学习会话历史 */
  studySessions: StudySession[];
  /** 最后学习时间 */
  lastStudyTime?: Date;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 进度统计摘要
 */
export interface ProgressSummary {
  /** 今日学习统计 */
  today: DailyStats;
  /** 本周学习统计 */
  thisWeek: {
    totalWords: number;
    totalTime: number;
    averageAccuracy: number;
    sessionsCount: number;
  };
  /** 本月学习统计 */
  thisMonth: {
    totalWords: number;
    totalTime: number;
    averageAccuracy: number;
    sessionsCount: number;
  };
  /** 连续学习天数 */
  streakDays: number;
  /** 总掌握词汇数 */
  totalMastered: number;
  /** 当前等级信息 */
  levelInfo: {
    level: number;
    currentExp: number;
    nextLevelExp: number;
    progress: number; // 0-1之间的进度百分比
  };
}

/**
 * 学习目标接口
 */
export interface LearningGoal {
  /** 目标ID */
  id: string;
  /** 目标类型 */
  type: 'daily_words' | 'daily_time' | 'weekly_words' | 'accuracy_rate';
  /** 目标名称 */
  name: string;
  /** 目标值 */
  target: number;
  /** 当前进度 */
  current: number;
  /** 是否已完成 */
  completed: boolean;
  /** 截止日期 */
  deadline?: Date;
  /** 创建时间 */
  createdAt: Date;
}