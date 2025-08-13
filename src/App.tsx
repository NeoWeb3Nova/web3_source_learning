import React, { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { VocabularyProvider } from '@/contexts/VocabularyContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { AppRouter } from '@/components/Layout';
import { 
  AppStateRestore, 
  FloatingAutoSaveStatus, 
  ErrorBoundary,
  NetworkStatusProvider 
} from '@/components/common';
import { VocabularyItem, UserProgress, UserSettings } from '@/types';
import theme from './theme';

function App() {
  // 简化应用启动逻辑，暂时跳过复杂的状态恢复

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary
        showDetails={import.meta.env.DEV}
        onError={(error, errorInfo) => {
          // 在生产环境中，这里可以发送错误报告到监控服务
          console.error('Global error caught:', error, errorInfo);
        }}
      >
        <NetworkStatusProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            {/* 主应用内容 - 暂时跳过状态恢复 */}
            <VocabularyProvider>
              <ProgressProvider>
                <AppRouter />
                {/* 浮动自动保存状态指示器 */}
                <FloatingAutoSaveStatus />
              </ProgressProvider>
            </VocabularyProvider>
          </Router>
        </NetworkStatusProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;