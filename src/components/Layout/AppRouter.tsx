import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { Layout } from './Layout';

// 懒加载页面组件
const HomePage = React.lazy(() => import('@/pages/Home'));
const VocabularyPage = React.lazy(() => import('@/pages/Vocabulary'));
const PracticePage = React.lazy(() => import('@/pages/Practice'));
const ProgressPage = React.lazy(() => import('@/pages/Progress'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));
const RefreshablePage = React.lazy(() => import('@/components/pages/RefreshablePage'));
const ErrorHandlingDemo = React.lazy(() => import('@/components/pages/ErrorHandlingDemo'));

// 词汇子页面
const AllVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/AllVocabulary'));
const FavoriteVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/FavoriteVocabulary'));
const MasteredVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/MasteredVocabulary'));
const LearningVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/LearningVocabulary'));

// 练习子页面
const QuickPracticePage = React.lazy(() => import('@/pages/Practice/QuickPractice'));
const TimedPracticePage = React.lazy(() => import('@/pages/Practice/TimedPractice'));
const ReviewPracticePage = React.lazy(() => import('@/pages/Practice/ReviewPractice'));

/**
 * 加载中组件
 */
const LoadingFallback: React.FC = () => (
  <Center h="200px">
    <VStack spacing={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="primary.500"
        size="xl"
      />
      <Text color="gray.600" fontSize="sm">
        页面加载中...
      </Text>
    </VStack>
  </Center>
);

/**
 * 404页面组件
 */
const NotFoundPage: React.FC = () => (
  <Center h="400px">
    <VStack spacing={4}>
      <Text fontSize="6xl" fontWeight="bold" color="gray.400">
        404
      </Text>
      <Text fontSize="xl" color="gray.600">
        页面未找到
      </Text>
      <Text color="gray.500" textAlign="center">
        您访问的页面不存在，请检查URL是否正确
      </Text>
    </VStack>
  </Center>
);

/**
 * 路由配置接口
 */
interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
}

/**
 * 路由配置
 */
const routeConfig: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
  },
  {
    path: '/vocabulary',
    element: VocabularyPage,
    children: [
      {
        path: 'all',
        element: AllVocabularyPage,
      },
      {
        path: 'favorites',
        element: FavoriteVocabularyPage,
      },
      {
        path: 'mastered',
        element: MasteredVocabularyPage,
      },
      {
        path: 'learning',
        element: LearningVocabularyPage,
      },
    ],
  },
  {
    path: '/practice',
    element: PracticePage,
    children: [
      {
        path: 'quick',
        element: QuickPracticePage,
      },
      {
        path: 'timed',
        element: TimedPracticePage,
      },
      {
        path: 'review',
        element: ReviewPracticePage,
      },
    ],
  },
  {
    path: '/progress',
    element: ProgressPage,
  },
  {
    path: '/settings',
    element: SettingsPage,
  },
  {
    path: '/refresh-demo',
    element: RefreshablePage,
  },
  {
    path: '/error-demo',
    element: ErrorHandlingDemo,
  },
];

/**
 * 渲染路由
 */
const renderRoutes = (routes: RouteConfig[]): React.ReactElement[] => {
  return routes.map((route) => {
    const Element = route.element;
    
    if (route.children) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Element />
            </Suspense>
          }
        >
          {/* 默认重定向到第一个子路由 */}
          <Route
            index
            element={<Navigate to={route.children[0].path} replace />}
          />
          {renderRoutes(route.children)}
        </Route>
      );
    }

    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Element />
          </Suspense>
        }
      />
    );
  });
};

/**
 * 应用路由组件
 */
export const AppRouter: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* 主要路由 */}
        {renderRoutes(routeConfig)}
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter;