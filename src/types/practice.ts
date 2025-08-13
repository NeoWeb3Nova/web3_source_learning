import { VocabularyItem } from './vocabulary';

/**
 * 题目类型枚举
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  LISTENING = 'listening',
  DRAG_DROP = 'drag_drop',
  TRUE_FALSE = 'true_false',
  MATCHING = 'matching',
}

/**
 * 练习难度枚举
 */
export enum PracticeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * 基础题目接口
 */
export interface BaseQuestion {
  /** 题目ID */
  id: string;
  /** 题目类型 */
  type: QuestionType;
  /** 关联的词汇项 */
  vocabulary: VocabularyItem;
  /** 题目文本 */
  question: string;
  /** 正确答案 */
  correctAnswer: string;
  /** 答案解释 */
  explanation?: string;
  /** 答题时间限制（秒） */
  timeLimit: number;
  /** 题目难度 */
  difficulty: PracticeDifficulty;
  /** 题目分值 */
  points: number;
}

/**
 * 选择题接口
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  /** 选项列表 */
  options: string[];
  /** 正确选项索引 */
  correctIndex: number;
}

/**
 * 填空题接口
 */
export interface FillBlankQuestion extends BaseQuestion {
  type: QuestionType.FILL_BLANK;
  /** 带空格的句子模板 */
  template: string;
  /** 空格位置信息 */
  blanks: {
    index: number;
    answer: string;
    hints?: string[];
  }[];
}

/**
 * 听力题接口
 */
export interface ListeningQuestion extends BaseQuestion {
  type: QuestionType.LISTENING;
  /** 音频文件URL */
  audioUrl: string;
  /** 音频时长（秒） */
  audioDuration: number;
  /** 播放次数限制 */
  playLimit?: number;
}

/**
 * 拖拽排序题接口
 */
export interface DragDropQuestion extends BaseQuestion {
  type: QuestionType.DRAG_DROP;
  /** 待排序的项目列表 */
  items: {
    id: string;
    content: string;
    correctPosition: number;
  }[];
}

/**
 * 判断题接口
 */
export interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TRUE_FALSE;
  /** 是否为真 */
  isTrue: boolean;
}

/**
 * 匹配题接口
 */
export interface MatchingQuestion extends BaseQuestion {
  type: QuestionType.MATCHING;
  /** 左侧项目列表 */
  leftItems: {
    id: string;
    content: string;
  }[];
  /** 右侧项目列表 */
  rightItems: {
    id: string;
    content: string;
  }[];
  /** 正确匹配关系 */
  correctMatches: {
    leftId: string;
    rightId: string;
  }[];
}

/**
 * 联合题目类型
 */
export type QuizQuestion = 
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | ListeningQuestion
  | DragDropQuestion
  | TrueFalseQuestion
  | MatchingQuestion;

/**
 * 用户答案接口
 */
export interface UserAnswer {
  /** 题目ID */
  questionId: string;
  /** 用户答案 */
  answer: string | string[] | { [key: string]: string };
  /** 是否正确 */
  isCorrect: boolean;
  /** 答题时间（秒） */
  timeSpent: number;
  /** 答题时间戳 */
  answeredAt: Date;
  /** 获得分数 */
  score: number;
}

/**
 * 练习会话接口
 */
export interface PracticeSession {
  /** 会话ID */
  id: string;
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 题目列表 */
  questions: QuizQuestion[];
  /** 用户答案列表 */
  answers: UserAnswer[];
  /** 总分数 */
  totalScore: number;
  /** 最高可能分数 */
  maxScore: number;
  /** 正确率 */
  accuracy: number;
  /** 会话状态 */
  status: 'in_progress' | 'completed' | 'abandoned';
  /** 练习模式 */
  mode: 'quick' | 'timed' | 'challenge' | 'review';
  /** 练习配置 */
  config: PracticeConfig;
}

/**
 * 练习配置接口
 */
export interface PracticeConfig {
  /** 题目数量 */
  questionCount: number;
  /** 题目类型过滤 */
  questionTypes?: QuestionType[];
  /** 难度过滤 */
  difficulties?: PracticeDifficulty[];
  /** 词汇分类过滤 */
  categories?: string[];
  /** 是否启用计时 */
  timedMode: boolean;
  /** 总时间限制（秒） */
  totalTimeLimit?: number;
  /** 是否显示即时反馈 */
  showInstantFeedback: boolean;
  /** 是否允许跳过 */
  allowSkip: boolean;
  /** 是否随机顺序 */
  randomOrder: boolean;
}

/**
 * 练习结果统计
 */
export interface PracticeResult {
  /** 会话ID */
  sessionId: string;
  /** 总题数 */
  totalQuestions: number;
  /** 正确题数 */
  correctAnswers: number;
  /** 错误题数 */
  wrongAnswers: number;
  /** 跳过题数 */
  skippedAnswers: number;
  /** 正确率 */
  accuracy: number;
  /** 总用时（秒） */
  totalTime: number;
  /** 平均答题时间（秒） */
  averageTime: number;
  /** 获得总分 */
  totalScore: number;
  /** 按题型统计 */
  byQuestionType: Record<QuestionType, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  /** 按难度统计 */
  byDifficulty: Record<PracticeDifficulty, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  /** 薄弱知识点 */
  weakAreas: string[];
  /** 建议复习的词汇 */
  reviewSuggestions: string[];
}