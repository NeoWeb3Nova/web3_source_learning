import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');
  
  // 启动浏览器进行预热
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 等待应用启动
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    
    // 检查应用是否正常加载
    await page.waitForSelector('[data-testid="app-root"]', { timeout: 30000 });
    console.log('✅ Application is ready for testing');
    
    // 预加载一些测试数据
    await setupTestData(page);
    
  } catch (error) {
    console.error('❌ Failed to setup E2E tests:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  console.log('📝 Setting up test data...');
  
  // 清理本地存储
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // 设置测试用的词汇数据
  const testVocabulary = [
    {
      id: 'test-1',
      word: 'Blockchain',
      definition: 'A distributed ledger technology',
      pronunciation: '/ˈblɒktʃeɪn/',
      audioUrl: 'https://example.com/audio/blockchain.mp3',
      examples: ['Bitcoin uses blockchain technology'],
      category: 'BLOCKCHAIN',
      difficulty: 'BEGINNER',
      tags: ['technology', 'crypto'],
      isCustom: false,
      studyCount: 0,
      accuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'test-2',
      word: 'DeFi',
      definition: 'Decentralized Finance',
      pronunciation: '/ˈdiːfaɪ/',
      audioUrl: 'https://example.com/audio/defi.mp3',
      examples: ['DeFi protocols enable lending without banks'],
      category: 'DEFI',
      difficulty: 'INTERMEDIATE',
      tags: ['finance', 'defi'],
      isCustom: false,
      studyCount: 0,
      accuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'test-3',
      word: 'NFT',
      definition: 'Non-Fungible Token',
      pronunciation: '/ˌenˌefˈtiː/',
      audioUrl: 'https://example.com/audio/nft.mp3',
      examples: ['NFTs represent unique digital assets'],
      category: 'NFT',
      difficulty: 'BEGINNER',
      tags: ['token', 'digital'],
      isCustom: false,
      studyCount: 0,
      accuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  // 注入测试数据到本地存储
  await page.evaluate((vocabulary) => {
    localStorage.setItem('vocabulary-items', JSON.stringify(vocabulary));
    localStorage.setItem('vocabulary-state', JSON.stringify({
      vocabulary,
      favorites: [],
      currentWord: null,
      loading: false,
      error: null,
    }));
    
    // 设置初始进度数据
    localStorage.setItem('progress-state', JSON.stringify({
      totalStudied: 0,
      correctAnswers: 0,
      streak: 0,
      longestStreak: 0,
      studyTime: 0,
      achievements: [],
      dailyStats: [],
      wordStats: {},
    }));
  }, testVocabulary);
  
  console.log('✅ Test data setup complete');
}

export default globalSetup;