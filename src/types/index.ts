// 词汇相关类型
export * from './vocabulary';

// 进度相关类型
export * from './progress';

// 练习相关类型
export * from './practice';

// API相关类型
export * from './api';

// 设置相关类型
export * from './settings';

/**
 * 通用工具类型
 */

/**
 * 可选字段类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必需字段类型
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度必需类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 键值对类型
 */
export type KeyValuePair<K extends string | number | symbol = string, V = any> = {
  [key in K]: V;
};

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * 异步函数类型
 */
export type AsyncFunction<T = any, R = any> = (args: T) => Promise<R>;

/**
 * 回调函数类型
 */
export type Callback<T = any, R = void> = (args: T) => R;

/**
 * 组件Props基础类型
 */
export interface BaseComponentProps {
  /** CSS类名 */
  className?: string;
  /** 内联样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 表单字段类型
 */
export interface FormField<T = any> {
  /** 字段名 */
  name: string;
  /** 字段值 */
  value: T;
  /** 字段标签 */
  label: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否必需 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 验证规则 */
  validation?: ValidationRule[];
}

/**
 * 验证规则类型
 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  /** 规则值 */
  value?: any;
  /** 错误消息 */
  message: string;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean;
}

/**
 * 分页参数类型
 */
export interface PaginationParams {
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 搜索参数类型
 */
export interface SearchParams extends PaginationParams {
  /** 搜索关键词 */
  keyword?: string;
  /** 过滤条件 */
  filters?: Record<string, any>;
}

/**
 * 操作结果类型
 */
export interface OperationResult<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 操作消息 */
  message?: string;
}

/**
 * 时间范围类型
 */
export interface TimeRange {
  /** 开始时间 */
  start: Date;
  /** 结束时间 */
  end: Date;
}

/**
 * 坐标点类型
 */
export interface Point {
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
}

/**
 * 尺寸类型
 */
export interface Size {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 矩形区域类型
 */
export interface Rect extends Point, Size {}

/**
 * 颜色类型
 */
export type Color = string;

/**
 * 主题颜色类型
 */
export interface ThemeColors {
  primary: Color;
  secondary: Color;
  success: Color;
  warning: Color;
  error: Color;
  info: Color;
  background: Color;
  surface: Color;
  text: Color;
  textSecondary: Color;
}