/**
 * 主题模式枚举
 */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * 语言枚举
 */
export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

/**
 * 音频设置接口
 */
export interface AudioSettings {
  /** 是否启用音频 */
  enabled: boolean;
  /** 音量大小 (0-1) */
  volume: number;
  /** 音频质量 */
  quality: 'low' | 'medium' | 'high';
  /** 自动播放发音 */
  autoPlay: boolean;
  /** 播放速度 */
  playbackSpeed: number;
}

/**
 * 学习设置接口
 */
export interface LearningSettings {
  /** 每日学习目标（单词数） */
  dailyWordGoal: number;
  /** 每日学习时间目标（分钟） */
  dailyTimeGoal: number;
  /** 复习间隔算法 */
  reviewAlgorithm: 'spaced_repetition' | 'fixed_interval' | 'adaptive';
  /** 难度自适应 */
  adaptiveDifficulty: boolean;
  /** 显示进度动画 */
  showProgressAnimations: boolean;
  /** 学习提醒 */
  studyReminders: {
    enabled: boolean;
    time: string; // HH:MM格式
    frequency: 'daily' | 'weekdays' | 'custom';
    customDays?: number[]; // 0-6，0为周日
  };
}

/**
 * 练习设置接口
 */
export interface PracticeSettings {
  /** 默认题目数量 */
  defaultQuestionCount: number;
  /** 默认时间限制（秒） */
  defaultTimeLimit: number;
  /** 是否显示即时反馈 */
  showInstantFeedback: boolean;
  /** 是否启用振动反馈 */
  hapticFeedback: boolean;
  /** 答错时是否显示正确答案 */
  showCorrectAnswer: boolean;
  /** 练习结束后是否显示详细统计 */
  showDetailedStats: boolean;
  /** 自动进入下一题 */
  autoNextQuestion: boolean;
  /** 自动进入下一题延迟（秒） */
  autoNextDelay: number;
}

/**
 * 界面设置接口
 */
export interface UISettings {
  /** 主题模式 */
  themeMode: ThemeMode;
  /** 语言 */
  language: Language;
  /** 字体大小 */
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  /** 是否启用动画 */
  enableAnimations: boolean;
  /** 是否启用手势 */
  enableGestures: boolean;
  /** 底部导航栏样式 */
  bottomNavStyle: 'tabs' | 'floating' | 'minimal';
  /** 卡片样式 */
  cardStyle: 'elevated' | 'outlined' | 'filled';
  /** 颜色对比度 */
  highContrast: boolean;
}

/**
 * 隐私设置接口
 */
export interface PrivacySettings {
  /** 是否允许数据收集 */
  allowDataCollection: boolean;
  /** 是否允许崩溃报告 */
  allowCrashReports: boolean;
  /** 是否允许使用统计 */
  allowUsageStats: boolean;
  /** 数据保留时间（天） */
  dataRetentionDays: number;
  /** 是否启用本地数据加密 */
  enableLocalEncryption: boolean;
}

/**
 * 通知设置接口
 */
export interface NotificationSettings {
  /** 是否启用通知 */
  enabled: boolean;
  /** 学习提醒 */
  studyReminders: boolean;
  /** 成就通知 */
  achievements: boolean;
  /** 连续学习提醒 */
  streakReminders: boolean;
  /** 每周总结 */
  weeklyReports: boolean;
  /** 通知声音 */
  sound: boolean;
  /** 通知振动 */
  vibration: boolean;
}

/**
 * 用户设置接口
 */
export interface UserSettings {
  /** 音频设置 */
  audio: AudioSettings;
  /** 学习设置 */
  learning: LearningSettings;
  /** 练习设置 */
  practice: PracticeSettings;
  /** 界面设置 */
  ui: UISettings;
  /** 隐私设置 */
  privacy: PrivacySettings;
  /** 通知设置 */
  notifications: NotificationSettings;
  /** 设置版本 */
  version: string;
  /** 最后更新时间 */
  lastUpdated: Date;
}

/**
 * 应用状态接口
 */
export interface AppState {
  /** 是否已初始化 */
  isInitialized: boolean;
  /** 是否首次启动 */
  isFirstLaunch: boolean;
  /** 当前版本 */
  version: string;
  /** 是否在线 */
  isOnline: boolean;
  /** 最后同步时间 */
  lastSyncTime?: Date;
  /** 当前页面 */
  currentPage: string;
  /** 加载状态 */
  loading: {
    vocabulary: boolean;
    progress: boolean;
    practice: boolean;
    sync: boolean;
  };
  /** 错误状态 */
  errors: {
    vocabulary?: string;
    progress?: string;
    practice?: string;
    sync?: string;
  };
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: 'mobile' | 'tablet' | 'desktop';
  /** 操作系统 */
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux';
  /** 浏览器 */
  browser: string;
  /** 屏幕尺寸 */
  screenSize: {
    width: number;
    height: number;
  };
  /** 是否支持触摸 */
  touchSupported: boolean;
  /** 是否支持振动 */
  vibrationSupported: boolean;
  /** 是否支持通知 */
  notificationSupported: boolean;
  /** 是否支持离线存储 */
  offlineStorageSupported: boolean;
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: UserSettings = {
  audio: {
    enabled: true,
    volume: 0.8,
    quality: 'medium',
    autoPlay: false,
    playbackSpeed: 1.0,
  },
  learning: {
    dailyWordGoal: 20,
    dailyTimeGoal: 30,
    reviewAlgorithm: 'spaced_repetition',
    adaptiveDifficulty: true,
    showProgressAnimations: true,
    studyReminders: {
      enabled: false,
      time: '19:00',
      frequency: 'daily',
    },
  },
  practice: {
    defaultQuestionCount: 10,
    defaultTimeLimit: 30,
    showInstantFeedback: true,
    hapticFeedback: true,
    showCorrectAnswer: true,
    showDetailedStats: true,
    autoNextQuestion: false,
    autoNextDelay: 2,
  },
  ui: {
    themeMode: ThemeMode.SYSTEM,
    language: Language.ZH_CN,
    fontSize: 'medium',
    enableAnimations: true,
    enableGestures: true,
    bottomNavStyle: 'tabs',
    cardStyle: 'elevated',
    highContrast: false,
  },
  privacy: {
    allowDataCollection: false,
    allowCrashReports: true,
    allowUsageStats: false,
    dataRetentionDays: 365,
    enableLocalEncryption: false,
  },
  notifications: {
    enabled: true,
    studyReminders: true,
    achievements: true,
    streakReminders: true,
    weeklyReports: false,
    sound: true,
    vibration: true,
  },
  version: '1.0.0',
  lastUpdated: new Date(),
};