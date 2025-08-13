/**
 * API响应状态枚举
 */
export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  LOADING = 'loading',
}

/**
 * 基础API响应接口
 */
export interface BaseApiResponse<T = any> {
  /** 响应状态 */
  status: ApiStatus;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: ApiError;
  /** 响应消息 */
  message?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> extends BaseApiResponse<T[]> {
  /** 分页信息 */
  pagination: {
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    limit: number;
    /** 总数量 */
    total: number;
    /** 总页数 */
    totalPages: number;
    /** 是否有下一页 */
    hasNext: boolean;
    /** 是否有上一页 */
    hasPrev: boolean;
  };
}

/**
 * API错误类型枚举
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  NOT_FOUND_ERROR = 'not_found_error',
  SERVER_ERROR = 'server_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * API错误接口
 */
export interface ApiError {
  /** 错误类型 */
  type: ApiErrorType;
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 详细错误信息 */
  details?: Record<string, any>;
  /** 错误堆栈（开发环境） */
  stack?: string;
  /** 请求ID */
  requestId?: string;
}

/**
 * 网络请求配置接口
 */
export interface RequestConfig {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求参数 */
  params?: Record<string, any>;
  /** 请求体 */
  data?: any;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否需要认证 */
  requireAuth?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * 词汇API响应类型
 */
export interface VocabularyApiResponse {
  /** 词汇列表 */
  vocabularies: Array<{
    word: string;
    definition: string;
    pronunciation: string;
    examples: string[];
    category: string;
    difficulty: string;
    tags: string[];
  }>;
  /** 总数量 */
  total: number;
  /** 数据版本 */
  version: string;
  /** 最后更新时间 */
  lastUpdated: string;
}

/**
 * 音频API响应类型
 */
export interface AudioApiResponse {
  /** 音频文件URL */
  audioUrl: string;
  /** 音频时长（秒） */
  duration: number;
  /** 音频格式 */
  format: 'mp3' | 'wav' | 'ogg';
  /** 音频质量 */
  quality: 'low' | 'medium' | 'high';
  /** 缓存过期时间 */
  expiresAt: string;
}

/**
 * 同步响应接口
 */
export interface SyncResponse {
  /** 同步状态 */
  status: 'success' | 'partial' | 'failed';
  /** 同步的数据类型 */
  dataTypes: string[];
  /** 同步统计 */
  stats: {
    created: number;
    updated: number;
    deleted: number;
    failed: number;
  };
  /** 冲突列表 */
  conflicts?: Array<{
    id: string;
    type: string;
    localVersion: any;
    remoteVersion: any;
  }>;
  /** 最后同步时间 */
  lastSyncTime: string;
}

/**
 * 加载状态接口
 */
export interface LoadingState {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 加载进度（0-100） */
  progress?: number;
  /** 加载消息 */
  message?: string;
  /** 加载类型 */
  type?: 'initial' | 'refresh' | 'loadMore' | 'sync';
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 缓存键 */
  key: string;
  /** 缓存时间（毫秒） */
  ttl: number;
  /** 是否启用缓存 */
  enabled: boolean;
  /** 缓存策略 */
  strategy: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  /** 最大缓存大小 */
  maxSize?: number;
}

/**
 * 请求重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  delay: number;
  /** 延迟倍数（指数退避） */
  backoffMultiplier: number;
  /** 最大延迟时间（毫秒） */
  maxDelay: number;
  /** 可重试的错误类型 */
  retryableErrors: ApiErrorType[];
}