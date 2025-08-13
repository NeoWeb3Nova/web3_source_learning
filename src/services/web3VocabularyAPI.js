import { Web3Category, DifficultyLevel, } from '@/types';
export class Web3VocabularyAPI {
    constructor() {
        Object.defineProperty(this, "baseURL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'https://api.web3vocabulary.com'
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cacheExpiry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 24 * 60 * 60 * 1000
        });
    }
    static getInstance() {
        if (!Web3VocabularyAPI.instance) {
            Web3VocabularyAPI.instance = new Web3VocabularyAPI();
        }
        return Web3VocabularyAPI.instance;
    }
    async getWeb3Vocabulary(limit = 1000) {
        try {
            const cacheKey = `web3_vocab_${limit}`;
            const cached = this.getCachedData(cacheKey);
            if (cached) {
                return {
                    success: true,
                    data: cached,
                    message: '从缓存获取词汇数据',
                };
            }
            const vocabularyData = await this.generateWeb3Vocabulary(limit);
            this.setCachedData(cacheKey, vocabularyData);
            return {
                success: true,
                data: vocabularyData,
                message: `成功获取 ${vocabularyData.length} 个Web3.0词汇`,
            };
        }
        catch (error) {
            console.error('Failed to fetch Web3 vocabulary:', error);
            return {
                success: false,
                error: '获取Web3.0词汇失败',
                message: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    async generateWeb3Vocabulary(limit) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const web3VocabularyData = [
            {
                word: 'Blockchain',
                definition: '区块链，一种分布式账本技术',
                englishDefinition: 'A distributed ledger technology that maintains a continuously growing list of records',
                pronunciation: 'blɒktʃeɪn',
                category: Web3Category.BLOCKCHAIN,
                difficulty: DifficultyLevel.BEGINNER,
                tags: ['基础', '技术', '分布式'],
                examples: [
                    '区块链技术确保了数据的不可篡改性。',
                    'Blockchain technology ensures data immutability.',
                ],
            },
            {
                word: 'Hash',
                definition: '哈希，将任意长度的输入转换为固定长度输出的函数',
                englishDefinition: 'A function that converts input of any length into a fixed-length output',
                pronunciation: 'hæʃ',
                category: Web3Category.BLOCKCHAIN,
                difficulty: DifficultyLevel.INTERMEDIATE,
                tags: ['加密', '算法', '安全'],
                examples: [
                    '每个区块都包含前一个区块的哈希值。',
                    'Each block contains the hash of the previous block.',
                ],
            },
            {
                word: 'Node',
                definition: '节点，区块链网络中的参与者计算机',
                englishDefinition: 'A participant computer in the blockchain network',
                pronunciation: 'noʊd',
                category: Web3Category.BLOCKCHAIN,
                difficulty: DifficultyLevel.BEGINNER,
                tags: ['网络', '参与者', '计算机'],
                examples: [
                    '全节点存储完整的区块链数据。',
                    'Full nodes store the complete blockchain data.',
                ],
            },
            {
                word: 'DeFi',
                definition: '去中心化金融，基于区块链的金融服务',
                englishDefinition: 'Decentralized Finance - financial services built on blockchain',
                pronunciation: 'diːfaɪ',
                category: Web3Category.DEFI,
                difficulty: DifficultyLevel.BEGINNER,
                tags: ['金融', '去中心化', '服务'],
                examples: [
                    'DeFi协议允许用户无需银行即可借贷。',
                    'DeFi protocols allow users to lend and borrow without banks.',
                ],
            },
            {
                word: 'Liquidity Pool',
                definition: '流动性池，用于去中心化交易的代币资金池',
                englishDefinition: 'A pool of tokens locked in smart contracts to facilitate decentralized trading',
                pronunciation: 'lɪˈkwɪdɪti puːl',
                category: Web3Category.DEFI,
                difficulty: DifficultyLevel.ADVANCED,
                tags: ['流动性', '交易', 'AMM'],
                examples: [
                    '用户向流动性池提供代币来赚取手续费。',
                    'Users provide tokens to liquidity pools to earn trading fees.',
                ],
            },
            {
                word: 'Yield Farming',
                definition: '流动性挖矿，通过提供流动性获得奖励的过程',
                englishDefinition: 'The process of earning rewards by providing liquidity to DeFi protocols',
                pronunciation: 'jiːld ˈfɑːrmɪŋ',
                category: Web3Category.DEFI,
                difficulty: DifficultyLevel.ADVANCED,
                tags: ['挖矿', '奖励', '流动性'],
                examples: [
                    '流动性挖矿可以获得额外的代币奖励。',
                    'Yield farming can earn additional token rewards.',
                ],
            },
            {
                word: 'NFT',
                definition: '非同质化代币，独一无二的数字资产',
                englishDefinition: 'Non-Fungible Token - unique digital assets',
                pronunciation: 'ɛn ɛf tiː',
                category: Web3Category.NFT,
                difficulty: DifficultyLevel.BEGINNER,
                tags: ['代币', '数字资产', '独特'],
                examples: [
                    'NFT可以代表数字艺术品的所有权。',
                    'NFTs can represent ownership of digital artwork.',
                ],
            },
            {
                word: 'Metadata',
                definition: '元数据，描述NFT属性和特征的数据',
                englishDefinition: 'Data that describes the properties and characteristics of an NFT',
                pronunciation: 'ˈmetədeɪtə',
                category: Web3Category.NFT,
                difficulty: DifficultyLevel.INTERMEDIATE,
                tags: ['数据', '属性', '描述'],
                examples: [
                    'NFT的元数据包含图像URL和属性信息。',
                    'NFT metadata contains image URLs and attribute information.',
                ],
            },
            {
                word: 'DEX',
                definition: '去中心化交易所，无需中介的数字资产交易平台',
                englishDefinition: 'Decentralized Exchange - a platform for trading digital assets without intermediaries',
                pronunciation: 'deks',
                category: Web3Category.TRADING,
                difficulty: DifficultyLevel.INTERMEDIATE,
                tags: ['交易所', '去中心化', '交易'],
                examples: [
                    'DEX允许用户直接交易代币。',
                    'DEX allows users to trade tokens directly.',
                ],
            },
            {
                word: 'Slippage',
                definition: '滑点，交易执行价格与预期价格的差异',
                englishDefinition: 'The difference between expected and actual execution price of a trade',
                pronunciation: 'ˈslɪpɪdʒ',
                category: Web3Category.TRADING,
                difficulty: DifficultyLevel.ADVANCED,
                tags: ['价格', '差异', '交易'],
                examples: [
                    '大额交易可能导致较高的滑点。',
                    'Large trades may result in higher slippage.',
                ],
            },
            {
                word: 'Smart Contract',
                definition: '智能合约，自动执行的计算机程序',
                englishDefinition: 'Self-executing contracts with terms directly written into code',
                pronunciation: 'smɑːrt ˈkɒntrækt',
                category: Web3Category.PROTOCOL,
                difficulty: DifficultyLevel.INTERMEDIATE,
                tags: ['合约', '自动化', '程序'],
                examples: [
                    '智能合约消除了对中介的需求。',
                    'Smart contracts eliminate the need for intermediaries.',
                ],
            },
            {
                word: 'Oracle',
                definition: '预言机，为区块链提供外部数据的服务',
                englishDefinition: 'A service that provides external data to blockchain networks',
                pronunciation: 'ˈɔːrəkəl',
                category: Web3Category.PROTOCOL,
                difficulty: DifficultyLevel.ADVANCED,
                tags: ['数据', '外部', '服务'],
                examples: [
                    '预言机为DeFi协议提供价格数据。',
                    'Oracles provide price data for DeFi protocols.',
                ],
            },
        ];
        const generatedVocabulary = [];
        const baseVocabulary = web3VocabularyData;
        for (let i = 0; i < Math.min(limit, 1000); i++) {
            const baseIndex = i % baseVocabulary.length;
            const baseItem = baseVocabulary[baseIndex];
            const vocabularyItem = {
                id: `web3_${i + 1}`,
                word: i === baseIndex ? baseItem.word : `${baseItem.word} ${Math.floor(i / baseVocabulary.length) + 1}`,
                definition: baseItem.definition,
                englishDefinition: baseItem.englishDefinition,
                pronunciation: baseItem.pronunciation,
                examples: baseItem.examples,
                category: baseItem.category,
                difficulty: baseItem.difficulty,
                tags: baseItem.tags,
                isCustom: false,
                studyCount: 0,
                accuracy: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            generatedVocabulary.push(vocabularyItem);
        }
        return generatedVocabulary;
    }
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached) {
            return cached;
        }
        return null;
    }
    setCachedData(key, data) {
        this.cache.set(key, data);
    }
    clearCache() {
        this.cache.clear();
    }
}
export const web3VocabularyAPI = Web3VocabularyAPI.getInstance();
