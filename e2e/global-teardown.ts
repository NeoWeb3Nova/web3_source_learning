import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test cleanup...');
  
  try {
    // 清理测试生成的文件
    console.log('📁 Cleaning up test artifacts...');
    
    // 这里可以添加清理逻辑，比如：
    // - 清理测试数据库
    // - 删除临时文件
    // - 重置测试环境
    
    console.log('✅ E2E test cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup E2E tests:', error);
    // 不抛出错误，避免影响测试结果
  }
}

export default globalTeardown;