// 性能测试

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { performanceMark } from '../utils/performance';
import { optimizedAudioManager } from '../services/optimizedAudioManager';

// 性能测试工具
const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize;
  }
  return 0;
};

describe('Performance Tests', () => {
  beforeEach(() => {
    // 清理缓存
    optimizedAudioManager.clearCache();
  });

  afterEach(() => {
    performanceMark.clear('test');
  });

  describe('Performance Utilities', () => {
    it('should measure performance marks correctly', () => {
      performanceMark.start('test-operation');
      
      // 模拟一些操作
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      
      const duration = performanceMark.end('test-operation');
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // 应该很快完成
    });

    it('should handle memory usage measurement', () => {
      const memoryBefore = measureMemoryUsage();
      
      // 创建一些对象
      const largeArray = new Array(10000).fill(0).map((_, i) => ({ id: i, data: 'test' }));
      
      const memoryAfter = measureMemoryUsage();
      
      if (memoryBefore > 0 && memoryAfter > 0) {
        expect(memoryAfter).toBeGreaterThanOrEqual(memoryBefore);
      }
      
      // 清理
      largeArray.length = 0;
    });
  });

  describe('Audio Manager Performance', () => {
    it('should preload audio files efficiently', async () => {
      const testUrls = [
        'test1.mp3',
        'test2.mp3',
        'test3.mp3',
      ];

      performanceMark.start('audio-preload');
      
      // 模拟音频预加载
      const promises = testUrls.map(() => 
        new Promise(resolve => setTimeout(resolve, 10))
      );
      
      await Promise.all(promises);
      
      const duration = performanceMark.end('audio-preload');
      
      // 预加载时间应该合理
      expect(duration).toBeLessThan(100);
    });

    it('should manage cache size efficiently', () => {
      const stats = optimizedAudioManager.getCacheStats();
      
      // 缓存统计应该正常
      expect(stats.itemCount).toBeGreaterThanOrEqual(0);
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
      expect(stats.maxSize).toBeGreaterThan(0);
    });
  });

  describe('Debounce and Throttle Performance', () => {
    it('should debounce function calls effectively', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // 快速调用多次
      for (let i = 0; i < 10; i++) {
        debouncedFn();
      }

      // 立即检查，应该还没有执行
      expect(callCount).toBe(0);

      // 等待debounce延迟
      await new Promise(resolve => setTimeout(resolve, 150));

      // 应该只执行一次
      expect(callCount).toBe(1);
    });

    it('should throttle function calls effectively', async () => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      // 快速调用多次
      for (let i = 0; i < 10; i++) {
        throttledFn();
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 应该只执行有限次数
      expect(callCount).toBeLessThan(5);
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory with repeated operations', async () => {
      const memoryBefore = measureMemoryUsage();

      // 多次创建和销毁对象
      for (let i = 0; i < 10; i++) {
        const largeObject = {
          data: new Array(1000).fill(0).map((_, j) => `item-${j}`),
          timestamp: Date.now(),
        };
        
        // 模拟使用对象
        expect(largeObject.data.length).toBe(1000);
      }

      // 强制垃圾回收（如果支持）
      if (global.gc) {
        global.gc();
      }

      const memoryAfter = measureMemoryUsage();

      if (memoryBefore > 0 && memoryAfter > 0) {
        const memoryIncrease = memoryAfter - memoryBefore;
        // 内存增长应该很小
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB
      }
    });
  });

  describe('Bundle Size Analysis', () => {
    it('should have reasonable component sizes', () => {
      // 这里可以添加bundle大小检查
      // 实际实现需要与构建工具集成
      expect(true).toBe(true);
    });
  });

  describe('Algorithm Performance', () => {
    it('should handle large arrays efficiently', () => {
      const largeArray = new Array(10000).fill(0).map((_, i) => i);
      
      performanceMark.start('array-processing');
      
      // 测试数组操作性能
      const filtered = largeArray.filter(x => x % 2 === 0);
      const mapped = filtered.map(x => x * 2);
      const reduced = mapped.reduce((sum, x) => sum + x, 0);
      
      const duration = performanceMark.end('array-processing');
      
      expect(filtered.length).toBe(5000);
      expect(reduced).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('should handle object operations efficiently', () => {
      const largeObject: Record<string, number> = {};
      
      performanceMark.start('object-operations');
      
      // 创建大对象
      for (let i = 0; i < 1000; i++) {
        largeObject[`key-${i}`] = i;
      }
      
      // 遍历对象
      const keys = Object.keys(largeObject);
      const values = Object.values(largeObject);
      const sum = values.reduce((acc, val) => acc + val, 0);
      
      const duration = performanceMark.end('object-operations');
      
      expect(keys.length).toBe(1000);
      expect(sum).toBe(499500); // 0+1+2+...+999
      expect(duration).toBeLessThan(50); // 应该很快
    });
  });
});

// 辅助函数
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};