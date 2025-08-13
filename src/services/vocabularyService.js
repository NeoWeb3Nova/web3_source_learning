import { VocabularySortBy, SortDirection, } from '@/types';
import { storageService, StorageKey } from './storage';
export class VocabularyService {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    static getInstance() {
        if (!VocabularyService.instance) {
            VocabularyService.instance = new VocabularyService();
        }
        return VocabularyService.instance;
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            const savedVocabulary = storageService.getItem(StorageKey.VOCABULARY_DATA);
            if (savedVocabulary) {
                savedVocabulary.forEach(item => {
                    this.cache.set(item.id, item);
                });
            }
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Failed to initialize vocabulary service:', error);
            throw new Error('词汇服务初始化失败');
        }
    }
    async getAllVocabulary() {
        await this.initialize();
        return Array.from(this.cache.values());
    }
    async getVocabularyById(id) {
        await this.initialize();
        return this.cache.get(id) || null;
    }
    async addVocabulary(vocabulary) {
        try {
            await this.initialize();
            const existingWord = Array.from(this.cache.values()).find(item => item.word.toLowerCase() === vocabulary.word.toLowerCase());
            if (existingWord) {
                return {
                    success: false,
                    error: '该单词已存在',
                    message: `单词 "${vocabulary.word}" 已经在词汇库中`,
                };
            }
            const newVocabulary = {
                ...vocabulary,
                id: this.generateId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                studyCount: 0,
                accuracy: 0,
            };
            this.cache.set(newVocabulary.id, newVocabulary);
            await this.saveToStorage();
            return {
                success: true,
                data: newVocabulary,
                message: '词汇添加成功',
            };
        }
        catch (error) {
            console.error('Failed to add vocabulary:', error);
            return {
                success: false,
                error: '添加词汇失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async updateVocabulary(vocabulary) {
        try {
            await this.initialize();
            if (!this.cache.has(vocabulary.id)) {
                return {
                    success: false,
                    error: '词汇不存在',
                    message: `ID为 "${vocabulary.id}" 的词汇不存在`,
                };
            }
            const updatedVocabulary = {
                ...vocabulary,
                updatedAt: new Date(),
            };
            this.cache.set(vocabulary.id, updatedVocabulary);
            await this.saveToStorage();
            return {
                success: true,
                data: updatedVocabulary,
                message: '词汇更新成功',
            };
        }
        catch (error) {
            console.error('Failed to update vocabulary:', error);
            return {
                success: false,
                error: '更新词汇失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async deleteVocabulary(id) {
        try {
            await this.initialize();
            if (!this.cache.has(id)) {
                return {
                    success: false,
                    error: '词汇不存在',
                    message: `ID为 "${id}" 的词汇不存在`,
                };
            }
            this.cache.delete(id);
            await this.saveToStorage();
            return {
                success: true,
                message: '词汇删除成功',
            };
        }
        catch (error) {
            console.error('Failed to delete vocabulary:', error);
            return {
                success: false,
                error: '删除词汇失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async addMultipleVocabulary(vocabularyList) {
        try {
            await this.initialize();
            const results = [];
            const errors = [];
            for (const vocabulary of vocabularyList) {
                const result = await this.addVocabulary(vocabulary);
                if (result.success && result.data) {
                    results.push(result.data);
                }
                else {
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
        }
        catch (error) {
            console.error('Failed to add multiple vocabulary:', error);
            return {
                success: false,
                error: '批量添加词汇失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async searchVocabulary(filter) {
        await this.initialize();
        let results = Array.from(this.cache.values());
        if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            results = results.filter(item => item.word.toLowerCase().includes(keyword) ||
                item.definition.toLowerCase().includes(keyword) ||
                item.englishDefinition?.toLowerCase().includes(keyword) ||
                item.tags.some(tag => tag.toLowerCase().includes(keyword)));
        }
        if (filter.categories && filter.categories.length > 0) {
            results = results.filter(item => filter.categories.includes(item.category));
        }
        if (filter.difficulties && filter.difficulties.length > 0) {
            results = results.filter(item => filter.difficulties.includes(item.difficulty));
        }
        if (filter.tags && filter.tags.length > 0) {
            results = results.filter(item => filter.tags.some(tag => item.tags.includes(tag)));
        }
        if (filter.customOnly) {
            results = results.filter(item => item.isCustom);
        }
        return results;
    }
    async getVocabularyStats() {
        await this.initialize();
        const vocabulary = Array.from(this.cache.values());
        const total = vocabulary.length;
        const mastered = vocabulary.filter(item => item.accuracy >= 0.8).length;
        const learning = vocabulary.filter(item => item.accuracy > 0 && item.accuracy < 0.8).length;
        const notStarted = vocabulary.filter(item => item.accuracy === 0).length;
        const byCategory = vocabulary.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});
        const byDifficulty = vocabulary.reduce((acc, item) => {
            acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
            return acc;
        }, {});
        return {
            total,
            mastered,
            learning,
            notStarted,
            byCategory,
            byDifficulty,
        };
    }
    sortVocabulary(vocabulary, sortBy, direction) {
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
    async updateStudyStats(id, isCorrect) {
        try {
            const vocabulary = await this.getVocabularyById(id);
            if (!vocabulary) {
                return {
                    success: false,
                    error: '词汇不存在',
                };
            }
            vocabulary.studyCount += 1;
            const weight = Math.min(vocabulary.studyCount, 10) / 10;
            vocabulary.accuracy = vocabulary.accuracy * (1 - weight) + (isCorrect ? 1 : 0) * weight;
            return await this.updateVocabulary(vocabulary);
        }
        catch (error) {
            console.error('Failed to update study stats:', error);
            return {
                success: false,
                error: '更新学习统计失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async getRandomVocabulary(count = 1, filter) {
        let vocabulary = await this.getAllVocabulary();
        if (filter) {
            vocabulary = await this.searchVocabulary(filter);
        }
        if (vocabulary.length === 0) {
            return [];
        }
        const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    async exportVocabulary(format = 'json') {
        try {
            const vocabulary = await this.getAllVocabulary();
            if (format === 'json') {
                const jsonData = JSON.stringify(vocabulary, null, 2);
                return {
                    success: true,
                    data: jsonData,
                    message: '词汇数据导出成功',
                };
            }
            else if (format === 'csv') {
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
        }
        catch (error) {
            console.error('Failed to export vocabulary:', error);
            return {
                success: false,
                error: '导出词汇数据失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async importVocabulary(data, format = 'json') {
        try {
            let vocabularyList = [];
            if (format === 'json') {
                const parsed = JSON.parse(data);
                vocabularyList = Array.isArray(parsed) ? parsed : [parsed];
            }
            else if (format === 'csv') {
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
                            category: values[4],
                            difficulty: values[5],
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
        }
        catch (error) {
            console.error('Failed to import vocabulary:', error);
            return {
                success: false,
                error: '导入词汇数据失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async clearAllVocabulary() {
        try {
            this.cache.clear();
            await this.saveToStorage();
            return {
                success: true,
                message: '所有词汇已清空',
            };
        }
        catch (error) {
            console.error('Failed to clear vocabulary:', error);
            return {
                success: false,
                error: '清空词汇失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    generateId() {
        return `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async saveToStorage() {
        const vocabulary = Array.from(this.cache.values());
        storageService.setItem(StorageKey.VOCABULARY_DATA, vocabulary);
    }
}
export const vocabularyService = VocabularyService.getInstance();
