/**
 * Web3.0和DeFi领域分类枚举
 */
export enum Web3Category {
  BLOCKCHAIN = 'blockchain',
  DEFI = 'defi',
  NFT = 'nft',
  TRADING = 'trading',
  PROTOCOL = 'protocol',
  CONSENSUS = 'consensus',
  SECURITY = 'security',
  GOVERNANCE = 'governance',
}

/**
 * 词汇难度等级枚举
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * 词汇项目接口
 */
export interface VocabularyItem {
  /** 唯一标识符 */
  id: string;
  /** 单词或术语 */
  word: string;
  /** 中文释义 */
  definition: string;
  /** 英文释义（可选） */
  englishDefinition?: string;
  /** 音标 */
  pronunciation: string;
  /** 音频文件URL */
  audioUrl?: string;
  /** 例句列表 */
  examples: string[];
  /** 所属分类 */
  category: Web3Category;
  /** 难度等级 */
  difficulty: DifficultyLevel;
  /** 标签列表 */
  tags: string[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 是否为用户自定义词汇 */
  isCustom: boolean;
  /** 学习次数 */
  studyCount: number;
  /** 正确率 */
  accuracy: number;
}

/**
 * 词汇统计信息
 */
export interface VocabularyStats {
  /** 总词汇数 */
  total: number;
  /** 已掌握词汇数 */
  mastered: number;
  /** 学习中词汇数 */
  learning: number;
  /** 未开始词汇数 */
  notStarted: number;
  /** 按分类统计 */
  byCategory: Record<Web3Category, number>;
  /** 按难度统计 */
  byDifficulty: Record<DifficultyLevel, number>;
}

/**
 * 词汇搜索过滤器
 */
export interface VocabularyFilter {
  /** 搜索关键词 */
  keyword?: string;
  /** 分类过滤 */
  categories?: Web3Category[];
  /** 难度过滤 */
  difficulties?: DifficultyLevel[];
  /** 标签过滤 */
  tags?: string[];
  /** 是否只显示收藏 */
  favoritesOnly?: boolean;
  /** 是否只显示自定义 */
  customOnly?: boolean;
}

/**
 * 词汇排序选项
 */
export enum VocabularySortBy {
  CREATED_AT = 'createdAt',
  WORD = 'word',
  DIFFICULTY = 'difficulty',
  ACCURACY = 'accuracy',
  STUDY_COUNT = 'studyCount',
}

/**
 * 排序方向
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}