export var ThemeMode;
(function (ThemeMode) {
    ThemeMode["LIGHT"] = "light";
    ThemeMode["DARK"] = "dark";
    ThemeMode["SYSTEM"] = "system";
})(ThemeMode || (ThemeMode = {}));
export var Language;
(function (Language) {
    Language["ZH_CN"] = "zh-CN";
    Language["EN_US"] = "en-US";
})(Language || (Language = {}));
export const DEFAULT_SETTINGS = {
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
