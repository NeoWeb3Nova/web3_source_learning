import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle分析插件
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // 性能优化配置
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // React相关
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI库
          'ui-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          
          // 工具库
          'utils-vendor': ['date-fns'],
          
          // 图表库
          'chart-vendor': ['recharts'],
          
          // 拖拽库
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          
          // 动画库
          'animation-vendor': ['@react-spring/web'],
        },
        // 文件命名
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash].${ext}`;
          }
          if (/\.(mp3|wav|ogg|m4a)$/i.test(assetInfo.name || '')) {
            return `audio/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    // 启用源码映射（生产环境可关闭）
    sourcemap: process.env.NODE_ENV === 'development',
    
    // 报告压缩后的文件大小
    reportCompressedSize: true,
    
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
    ],
    exclude: [
      // 排除一些不需要预构建的包
    ],
  },
  // 服务器配置
  server: {
    // 启用HTTP/2
    https: false,
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/Home.tsx',
        './src/components/Layout/Layout.tsx',
      ],
    },
  },
});