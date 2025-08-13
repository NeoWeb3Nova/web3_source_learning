import {
  VocabularyItem,
  VocabularyFilter,
  VocabularyStats,
  VocabularySortBy,
  SortDirection,
  Web3Category,
  DifficultyLevel,
  BaseApiResponse,
  VocabularyApiResponse,
  OperationResult,
} from '@/types';
import { storageService, StorageKey } from './storage';

/**
 * 词汇数据服务类
 * 处理词汇的CRUD操作和数据管理
 */
export class VocabularyService {
  private static instance: VocabularyService;
  private cache: Map<string, VocabularyItem> = new Map();
  private isInitialized = false;

  /**
   * 获取单例实例
   */
  static getInstance(): VocabularyService {
    if (!VocabularyService.instance) {
      VocabularyService.instance = new VocabularyService();
    }
    return VocabularyService.instance;
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const savedVocabulary = storageService.getItem<VocabularyItem[]>(StorageKey.VOCABULARY_DATA);
      if (savedVocabulary) {
        savedVocabulary.forEach(item => {
          this.cache.set(item.id, item);
        });
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize vocabulary service:', error);
      throw new Error('词汇服务初始化失败');
    }
  }

  /**
   * 获取所有词汇
   */
  async getAllVocabulary(): Promise<VocabularyItem[]> {
    await this.initialize();
    return Array.from(this.cache.values());
  }

  /**
   * 根据ID获取词汇
   */
  async getVocabularyById(id: string): Promise<VocabularyItem | null> {
    await this.initialize();
    return this.cache.get(id) || null;
  }

  /**
   * 添加词汇
   */
  async addVocabulary(vocabulary: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<VocabularyItem>> {
    try {
      await this.initialize();

      // 检查是否已存在相同单词
      const existingWord = Array.from(this.cache.values()).find(
        item => item.word.toLowerCase() === vocabulary.word.toLowerCase()
      );

      if (existingWord) {
        return {
          success: false,
          error: '该单词已存在',
          message: `单词 "${vocabulary.word}" 已经在词汇库中`,
        };
      }

      // 创建新词汇项
      const newVocabulary: VocabularyItem = {
        ...vocabulary,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        studyCount: 0,
        accuracy: 0,
      };

      // 添加到缓存
      this.cache.set(newVocabulary.id, newVocabulary);

      // 保存到存储
      await this.saveToStorage();

      return {
        success: true,
        data: newVocabulary,
        message: '词汇添加成功',
      };
    } catch (error) {
      console.error('Failed to add vocabulary:', error);
      return {
        success: false,
        error: '添加词汇失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 更新词汇
   */
  async updateVocabulary(vocabulary: VocabularyItem): Promise<OperationResult<VocabularyItem>> {
    try {
      await this.initialize();

      if (!this.cache.has(vocabulary.id)) {
        return {
          success: false,
          error: '词汇不存在',
          message: `ID为 "${vocabulary.id}" 的词汇不存在`,
        };
      }

      // 更新词汇项
      const updatedVocabulary: VocabularyItem = {
        ...vocabulary,
        updatedAt: new Date(),
      };

      // 更新缓存
      this.cache.set(vocabulary.id, updatedVocabulary);

      // 保存到存储
      await this.saveToStorage();

      return {
        success: true,
        data: updatedVocabulary,
        message: '词汇更新成功',
      };
    } catch (error) {
      console.error('Failed to update vocabulary:', error);
      return {
        success: false,
        error: '更新词汇失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 删除词汇
   */
  async deleteVocabulary(id: string): Promise<OperationResult<void>> {
    try {
      await this.initialize();

      if (!this.cache.has(id)) {
        return {
          success: false,
          error: '词汇不存在',
          message: `ID为 "${id}" 的词汇不存在`,
        };
      }

      // 从缓存中删除
      this.cache.delete(id);

      // 保存到存储
      await this.saveToStorage();

      return {
        success: true,
        message: '词汇删除成功',
      };
    } catch (error) {
      console.error('Failed to delete vocabulary:', error);
      return {
        success: false,
        error: '删除词汇失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 批量添加词汇
   */
  async addMultipleVocabulary(vocabularyList: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<OperationResult<VocabularyItem[]>> {
    try {
      await this.initialize();

      const results: VocabularyItem[] = [];
      const errors: string[] = [];

      for (const vocabulary of vocabularyList) {
        const result = await this.addVocabulary(vocabulary);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`${vocabulary.word}: ${result.error}`);
        }
      }

      return {
        success: errors.length === 0,
        data: results,
        message: errors.length === 0 
          ? `成功添加 ${results.length} 个词汇`
          : `添加了 ${results.length} 个词汇，${errors.length} 个失败`,
      };
    } catch (error) {
      console.error('Failed to add multiple vocabulary:', error);
      return {
        success: false,
        error: '批量添加词汇失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 搜索词汇
   */
  async searchVocabulary(filter: VocabularyFilter): Promise<VocabularyItem[]> {
    await this.initialize();
    
    let results = Array.from(this.cache.values());

    // 关键词过滤
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      results = results.filter(item =>
        item.word.toLowerCase().includes(keyword) ||
        item.definition.toLowerCase().includes(keyword) ||
        item.englishDefinition?.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }

    // 分类过滤
    if (filter.categories && filter.categories.length > 0) {
      results = results.filter(item => filter.categories!.includes(item.category));
    }

    // 难度过滤
    if (filter.difficulties && filter.difficulties.length > 0) {
      results = results.filter(item => filter.difficulties!.includes(item.difficulty));
    }

    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(item =>
        filter.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // 自定义词汇过滤
    if (filter.customOnly) {
      results = results.filter(item => item.isCustom);
    }

    return results;
  }

  /**
   * 获取词汇统计
   */
  async getVocabularyStats(): Promise<VocabularyStats> {
    await this.initialize();
    
    const vocabulary = Array.from(this.cache.values());
    const total = vocabulary.length;
    const mastered = vocabulary.filter(item => item.accuracy >= 0.8).length;
    const learning = vocabulary.filter(item => item.accuracy > 0 && item.accuracy < 0.8).length;
    const notStarted = vocabulary.filter(item => item.accuracy === 0).length;

    const byCategory = vocabulary.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<Web3Category, number>);

    const byDifficulty = vocabulary.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<DifficultyLevel, number>);

    return {
      total,
      mastered,
      learning,
      notStarted,
      byCategory,
      byDifficulty,
    };
  }

  /**
   * 排序词汇
   */
  sortVocabulary(vocabulary: VocabularyItem[], sortBy: VocabularySortBy, direction: SortDirection): VocabularyItem[] {
    return [...vocabulary].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case VocabularySortBy.WORD:
          comparison = a.word.localeCompare(b.word);
          break;
        case VocabularySortBy.DIFFICULTY:
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case VocabularySortBy.ACCURACY:
          comparison = a.accuracy - b.accuracy;
          break;
        case VocabularySortBy.STUDY_COUNT:
          comparison = a.studyCount - b.studyCount;
          break;
        case VocabularySortBy.CREATED_AT:
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return direction === SortDirection.ASC ? comparison : -comparison;
    });
  }

  /**
   * 更新学习统计
   */
  async updateStudyStats(id: string, isCorrect: boolean): Promise<OperationResult<VocabularyItem>> {
    try {
      const vocabulary = await this.getVocabularyById(id);
      if (!vocabulary) {
        return {
          success: false,
          error: '词汇不存在',
        };
      }

      // 更新学习次数
      vocabulary.studyCount += 1;

      // 更新准确率（使用简单的移动平均）
      const weight = Math.min(vocabulary.studyCount, 10) / 10; // 最多考虑最近10次
      vocabulary.accuracy = vocabulary.accuracy * (1 - weight) + (isCorrect ? 1 : 0) * weight;

      return await this.updateVocabulary(vocabulary);
    } catch (error) {
      console.error('Failed to update study stats:', error);
      return {
        success: false,
        error: '更新学习统计失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 获取随机词汇
   */
  async getRandomVocabulary(count: number = 1, filter?: VocabularyFilter): Promise<VocabularyItem[]> {
    let vocabulary = await this.getAllVocabulary();
    
    if (filter) {
      vocabulary = await this.searchVocabulary(filter);
    }

    if (vocabulary.length === 0) {
      return [];
    }

    // 随机打乱数组
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * 导出词汇数据
   */
  async exportVocabulary(format: 'json' | 'csv' = 'json'): Promise<OperationResult<string>> {
    try {
      const vocabulary = await this.getAllVocabulary();

      if (format === 'json') {
        const jsonData = JSON.stringify(vocabulary, null, 2);
        return {
          success: true,
          data: jsonData,
          message: '词汇数据导出成功',
        };
      } else if (format === 'csv') {
        const csvHeader = 'Word,Definition,English Definition,Pronunciation,Category,Difficulty,Tags,Examples,Study Count,Accuracy,Is Custom,Created At,Updated At\n';
        const csvRows = vocabulary.map(item => [
          item.word,
          `"${item.definition.replace(/"/g, '""')}"`,
          `"${item.englishDefinition?.replace(/"/g, '""') || ''}"`,
          item.pronunciation,
          item.category,
          item.difficulty,
          `"${item.tags.join(', ')}"`,
          `"${item.examples.join('; ').replace(/"/g, '""')}"`,
          item.studyCount,
          item.accuracy,
          item.isCustom,
          item.createdAt.toISOString(),
          item.updatedAt.toISOString(),
        ].join(','));

        const csvData = csvHeader + csvRows.join('\n');
        return {
          success: true,
          data: csvData,
          message: '词汇数据导出成功',
        };
      }

      return {
        success: false,
        error: '不支持的导出格式',
      };
    } catch (error) {
      console.error('Failed to export vocabulary:', error);
      return {
        success: false,
        error: '导出词汇数据失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 导入词汇数据
   */
  async importVocabulary(data: string, format: 'json' | 'csv' = 'json'): Promise<OperationResult<number>> {
    try {
      let vocabularyList: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      if (format === 'json') {
        const parsed = JSON.parse(data);
        vocabularyList = Array.isArray(parsed) ? parsed : [parsed];
      } else if (format === 'csv') {
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= headers.length) {
            vocabularyList.push({
              word: values[0],
              definition: values[1].replace(/^"|"$/g, '').replace(/""/g, '"'),
              englishDefinition: values[2].replace(/^"|"$/g, '').replace(/""/g, '"') || undefined,
              pronunciation: values[3],
              category: values[4] as Web3Category,
              difficulty: values[5] as DifficultyLevel,
              tags: values[6].replace(/^"|"$/g, '').split(', ').filter(Boolean),
              examples: values[7].replace(/^"|"$/g, '').replace(/""/g, '"').split('; ').filter(Boolean),
              studyCount: parseInt(values[8]) || 0,
              accuracy: parseFloat(values[9]) || 0,
              isCustom: values[10] === 'true',
            });
          }
        }
      }

      const result = await this.addMultipleVocabulary(vocabularyList);
      return {
        success: result.success,
        data: result.data?.length || 0,
        message: result.message,
      };
    } catch (error) {
      console.error('Failed to import vocabulary:', error);
      return {
        success: false,
        error: '导入词汇数据失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 清空所有词汇
   */
  async clearAllVocabulary(): Promise<OperationResult<void>> {
    try {
      this.cache.clear();
      await this.saveToStorage();
      
      return {
        success: true,
        message: '所有词汇已清空',
      };
    } catch (error) {
      console.error('Failed to clear vocabulary:', error);
      return {
        success: false,
        error: '清空词汇失败',
        message: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存到存储
   */
  private async saveToStorage(): Promise<void> {
    const vocabulary = Array.from(this.cache.values());
    storageService.setItem(StorageKey.VOCABULARY_DATA, vocabulary);
  }
}

/**
 * 词汇服务单例实例
 */
export const vocabularyService = VocabularyService.getInstance();