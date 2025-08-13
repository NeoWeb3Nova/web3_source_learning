import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { createLazyComponent, preloadComponent } from '../../utils/performance';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSkeleton from '../common/LoadingSkeleton';

// 懒加载页面组件
const HomePage = createLazyComponent(
  () => import('../../pages/Home'),
  'HomePage'
);

const PracticePage = createLazyComponent(
  () => import('../../pages/Practice'),
  'PracticePage'
);

const ProgressPage = createLazyComponent(
  () => import('../../pages/Progress'),
  'ProgressPage'
);

const SettingsPage = createLazyComponent(
  () => import('../../pages/Settings'),
  'SettingsPage'
);

const VocabularyPage = createLazyComponent(
  () => import('../../pages/Vocabulary'),
  'VocabularyPage'
);

// 练习子页面
const QuickPracticePage = createLazyComponent(
  () => import('../../pages/Practice/QuickPractice'),
  'QuickPracticePage'
);

const TimedPracticePage = createLazyComponent(
  () => import('../../pages/Practice/TimedPractice'),
  'TimedPracticePage'
);

const ReviewPracticePage = createLazyComponent(
  () => import('../../pages/Practice/ReviewPractice'),
  'ReviewPracticePage'
);

// 词汇子页面
const AllVocabularyPage = createLazyComponent(
  () => import('../../pages/Vocabulary/AllVocabulary'),
  'AllVocabularyPage'
);

const FavoriteVocabularyPage = createLazyComponent(
  () => import('../../pages/Vocabulary/FavoriteVocabulary'),
  'FavoriteVocabularyPage'
);

const LearningVocabularyPage = createLazyComponent(
  () => import('../../pages/Vocabulary/LearningVocabulary'),
  'LearningVocabularyPage'
);

const MasteredVocabularyPage = createLazyComponent(
  () => import('../../pages/Vocabulary/MasteredVocabulary'),
  'MasteredVocabularyPage'
);

// 加载组件
const PageLoadingFallback: React.FC<{ pageName?: string }> = ({ pageName }) => (
  <Box minH="100vh" bg="gray.50">
    <VStack spacing={6} justify="center" minH="100vh">
      <LoadingSkeleton type="card" repeat={1} />
      <VStack spacing={2}>
        <Spinner size="lg" color="blue.500" thickness="4px" />
        <Text color="gray.600" fontSize="sm">
          {pageName ? `正在加载${pageName}...` : '正在加载页面...'}
        </Text>
      </VStack>
    </VStack>
  </Box>
);

// 路由预加载策略
const preloadRoutes = {
  // 预加载主要页面
  preloadMainPages: () => {
    preloadComponent(() => import('../../pages/Home'));
    preloadComponent(() => import('../../pages/Practice'));
    preloadComponent(() => import('../../pages/Progress'));
  },
  
  // 预加载练习相关页面
  preloadPracticePages: () => {
    preloadComponent(() => import('../../pages/Practice/QuickPractice'));
    preloadComponent(() => import('../../pages/Practice/TimedPractice'));
    preloadComponent(() => import('../../pages/Practice/ReviewPractice'));
  },
  
  // 预加载词汇相关页面
  preloadVocabularyPages: () => {
    preloadComponent(() => import('../../pages/Vocabulary/AllVocabulary'));
    preloadComponent(() => import('../../pages/Vocabulary/FavoriteVocabulary'));
    preloadComponent(() => import('../../pages/Vocabulary/LearningVocabulary'));
    preloadComponent(() => import('../../pages/Vocabulary/MasteredVocabulary'));
  },
};

// 智能预加载Hook
const useRoutePreloading = () => {
  React.useEffect(() => {
    // 应用启动后预加载主要页面
    const timer = setTimeout(() => {
      preloadRoutes.preloadMainPages();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const preloadOnHover = React.useCallback((routeType: keyof typeof preloadRoutes) => {
    return () => {
      preloadRoutes[routeType]();
    };
  }, []);

  return { preloadOnHover };
};

const OptimizedRouter: React.FC = () => {
  const { preloadOnHover } = useRoutePreloading();

  return (
    <ErrorBoundary>
      <Routes>
        {/* 主页 */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="首页" />}>
              <HomePage />
            </Suspense>
          }
        />

        {/* 练习页面 */}
        <Route
          path="/practice"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="练习" />}>
              <PracticePage />
            </Suspense>
          }
        />
        <Route
          path="/practice/quick"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="快速练习" />}>
              <QuickPracticePage />
            </Suspense>
          }
        />
        <Route
          path="/practice/timed"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="计时练习" />}>
              <TimedPracticePage />
            </Suspense>
          }
        />
        <Route
          path="/practice/review"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="复习练习" />}>
              <ReviewPracticePage />
            </Suspense>
          }
        />

        {/* 进度页面 */}
        <Route
          path="/progress"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="学习进度" />}>
              <ProgressPage />
            </Suspense>
          }
        />

        {/* 词汇页面 */}
        <Route
          path="/vocabulary"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="词汇管理" />}>
              <VocabularyPage />
            </Suspense>
          }
        />
        <Route
          path="/vocabulary/all"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="所有词汇" />}>
              <AllVocabularyPage />
            </Suspense>
          }
        />
        <Route
          path="/vocabulary/favorites"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="收藏词汇" />}>
              <FavoriteVocabularyPage />
            </Suspense>
          }
        />
        <Route
          path="/vocabulary/learning"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="学习中词汇" />}>
              <LearningVocabularyPage />
            </Suspense>
          }
        />
        <Route
          path="/vocabulary/mastered"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="已掌握词汇" />}>
              <MasteredVocabularyPage />
            </Suspense>
          }
        />

        {/* 设置页面 */}
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoadingFallback pageName="设置" />}>
              <SettingsPage />
            </Suspense>
          }
        />

        {/* 404页面 */}
        <Route
          path="*"
          element={
            <Center minH="100vh">
              <VStack spacing={4}>
                <Text fontSize="6xl" color="gray.400">404</Text>
                <Text fontSize="xl" color="gray.600">页面未找到</Text>
              </VStack>
            </Center>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default OptimizedRouter;
export { preloadRoutes };