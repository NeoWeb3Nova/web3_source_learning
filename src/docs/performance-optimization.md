# 性能优化文档

## 概述

本文档描述了Web3.0 DeFi词汇大作战应用中实施的各种性能优化策略和技术。

## 优化策略

### 1. 代码分割 (Code Splitting)

#### 实现方式
- 使用React.lazy()和Suspense实现路由级别的代码分割
- 按功能模块分割代码块
- 智能预加载策略

#### 配置文件
```typescript
// vite.config.performance.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@chakra-ui/react', '@emotion/react', 'framer-motion'],
          'utils-vendor': ['date-fns'],
          'chart-vendor': ['recharts'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable'],
          'animation-vendor': ['@react-spring/web'],
        },
      },
    },
  },
});
```

#### 使用示例
```typescript
// 懒加载组件
const HomePage = createLazyComponent(
  () => import('../../pages/Home'),
  'HomePage'
);

// 预加载策略
const preloadRoutes = {
  preloadMainPages: () => {
    preloadComponent(() => import('../../pages/Home'));
    preloadComponent(() => import('../../pages/Practice'));
  },
};
```

### 2. 组件级别优化

#### React.memo
```typescript
const OptimizedComponent = React.memo<Props>(({ data }) => {
  return <div>{data.name}</div>;
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.data.id === nextProps.data.id;
});
```

#### useMemo和useCallback
```typescript
const ExpensiveComponent: React.FC<Props> = ({ items, onSelect }) => {
  // 缓存计算结果
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      processed: expensiveProcessing(item),
    }));
  }, [items]);

  // 缓存回调函数
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div>
      {processedItems.map(item => (
        <Item key={item.id} data={item} onSelect={handleSelect} />
      ))}
    </div>
  );
};
```

### 3. 图片优化

#### 懒加载
```typescript
const OptimizedImage: React.FC<Props> = ({ src, alt, lazy = true }) => {
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  // WebP支持检测
  useEffect(() => {
    supportsWebP().then(supported => {
      if (supported) {
        setOptimizedSrc(getOptimizedImageUrl(src, { format: 'webp' }));
      }
    });
  }, [src]);

  // 懒加载逻辑
  useEffect(() => {
    if (!lazy) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  return (
    <Box ref={containerRef}>
      {shouldLoad && (
        <Image src={optimizedSrc} alt={alt} />
      )}
    </Box>
  );
};
```

### 4. 音频优化

#### 预加载和缓存
```typescript
class OptimizedAudioManager {
  private cache = new Map<string, AudioCacheItem>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB

  async preloadAudio(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.loadAudioFile(url));
    await Promise.allSettled(promises);
  }

  private async loadAudioFile(url: string): Promise<HTMLAudioElement> {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        this.addToCache(url, audio);
        resolve(audio);
      });
      audio.addEventListener('error', reject);
      audio.src = url;
    });
  }
}
```

### 5. 虚拟滚动

#### 实现
```typescript
const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  return { visibleItems, visibleRange, handleScroll: setScrollTop };
};
```

### 6. 防抖和节流

#### 防抖 (Debounce)
```typescript
const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  return useCallback(
    debounce(callback, delay),
    [callback, delay]
  ) as T;
};

// 使用示例
const SearchComponent = () => {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useDebounce((searchQuery: string) => {
    performSearch(searchQuery);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <Input value={query} onChange={handleInputChange} />;
};
```

#### 节流 (Throttle)
```typescript
const ScrollComponent = () => {
  const throttledScroll = useThrottle((scrollTop: number) => {
    updateScrollPosition(scrollTop);
  }, 16); // 60fps

  return (
    <Box onScroll={(e) => throttledScroll(e.target.scrollTop)}>
      {/* 内容 */}
    </Box>
  );
};
```

### 7. 缓存策略

#### LRU缓存
```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移到最后（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

## 性能监控

### 1. 运行时监控
```typescript
const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>();

  useEffect(() => {
    const updateStats = () => {
      const memory = getMemoryUsage();
      const audioCache = optimizedAudioManager.getCacheStats();
      setStats({ memory, audioCache });
    };

    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Text>内存使用: {stats?.memory?.percentage.toFixed(1)}%</Text>
      <Text>音频缓存: {stats?.audioCache.itemCount} 项</Text>
    </Box>
  );
};
```

### 2. 性能标记
```typescript
const performanceMark = {
  start: (name: string) => performance.mark(`${name}-start`),
  end: (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure.duration;
  },
};

// 使用示例
const ExpensiveComponent = () => {
  useEffect(() => {
    performanceMark.start('component-render');
    return () => {
      const duration = performanceMark.end('component-render');
      if (duration > 16) {
        console.warn(`Component render took ${duration}ms`);
      }
    };
  });
};
```

## Bundle分析

### 1. 构建分析
```bash
# 分析bundle大小
npm run build:analyze

# 检查size限制
npm run size-limit

# 性能测试
npm run test:performance
```

### 2. 大小限制配置
```json
// .size-limit.json
[
  {
    "name": "Main Bundle",
    "path": "dist/assets/index-*.js",
    "limit": "500 KB",
    "gzip": true
  }
]
```

## 最佳实践

### 1. 组件设计
- 使用React.memo包装纯组件
- 合理使用useMemo和useCallback
- 避免在render中创建新对象
- 使用key属性优化列表渲染

### 2. 状态管理
- 避免不必要的状态更新
- 使用状态分割减少重渲染范围
- 合理使用Context避免prop drilling

### 3. 网络优化
- 实现请求缓存和去重
- 使用防抖减少API调用
- 预加载关键资源

### 4. 内存管理
- 及时清理事件监听器
- 避免内存泄漏
- 合理设置缓存大小限制

## 性能指标

### 目标指标
- **首次内容绘制 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **首次输入延迟 (FID)**: < 100ms
- **累积布局偏移 (CLS)**: < 0.1
- **总阻塞时间 (TBT)**: < 300ms

### 监控工具
- Chrome DevTools
- Lighthouse
- Web Vitals
- Bundle Analyzer
- Size Limit

## 故障排除

### 常见性能问题
1. **组件重渲染过多**: 检查依赖项，使用React DevTools Profiler
2. **内存泄漏**: 检查事件监听器和定时器清理
3. **Bundle过大**: 分析依赖项，实施代码分割
4. **图片加载慢**: 实施懒加载和格式优化
5. **音频播放卡顿**: 检查预加载策略和缓存配置

### 调试技巧
```typescript
// 性能调试Hook
const usePerformanceDebug = (componentName: string) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });

  useEffect(() => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(`${componentName} was mounted for ${duration}ms`);
    };
  }, []);
};
```