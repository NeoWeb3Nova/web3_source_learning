import { QuizQuestion, UserAnswer } from '@/types/practice';

/**
 * 基础题目组件Props
 */
export interface QuestionComponentProps {
  /** 题目数据 */
  question: QuizQuestion;
  /** 答题回调 */
  onAnswer: (answer: string | string[] | { [key: string]: string }) => void;
  /** 是否显示结果 */
  showResult?: boolean;
  /** 用户答案 */
  userAnswer?: UserAnswer;
  /** 是否禁用交互 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 计时器组件Props
 */
export interface TimerProps {
  /** 倒计时时长（秒） */
  duration: number;
  /** 时间结束回调 */
  onTimeUp: () => void;
  /** 是否暂停 */
  isPaused?: boolean;
  /** 是否显示警告状态 */
  showWarning?: boolean;
  /** 警告阈值（秒） */
  warningThreshold?: number;
  /** 自定义样式 */
  variant?: 'default' | 'compact' | 'large';
}

/**
 * 反馈显示组件Props
 */
export interface FeedbackProps {
  /** 是否正确 */
  isCorrect: boolean;
  /** 反馈消息 */
  message?: string;
  /** 解释说明 */
  explanation?: string;
  /** 正确答案 */
  correctAnswer?: string;
  /** 用户答案 */
  userAnswer?: string;
  /** 是否显示 */
  isVisible: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 继续下一题回调 */
  onNext?: () => void;
}

/**
 * 进度指示器Props
 */
export interface ProgressIndicatorProps {
  /** 当前题目索引 */
  current: number;
  /** 总题目数 */
  total: number;
  /** 已答题目数 */
  answered?: number;
  /** 正确题目数 */
  correct?: number;
  /** 显示模式 */
  mode?: 'simple' | 'detailed' | 'circular';
  /** 是否显示百分比 */
  showPercentage?: boolean;
}

/**
 * 答题选项Props
 */
export interface AnswerOptionProps {
  /** 选项内容 */
  content: string;
  /** 选项索引 */
  index: number;
  /** 是否被选中 */
  isSelected: boolean;
  /** 是否正确（显示结果时） */
  isCorrect?: boolean;
  /** 是否错误（显示结果时） */
  isWrong?: boolean;
  /** 点击回调 */
  onClick: (index: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}