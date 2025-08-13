import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { createLazyComponent, preloadComponent } from '../../utils/performance';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSkeleton from '../common/LoadingSkeleton';
const HomePage = createLazyComponent(() => import('../../pages/Home'), 'HomePage');
const PracticePage = createLazyComponent(() => import('../../pages/Practice'), 'PracticePage');
const ProgressPage = createLazyComponent(() => import('../../pages/Progress'), 'ProgressPage');
const SettingsPage = createLazyComponent(() => import('../../pages/Settings'), 'SettingsPage');
const VocabularyPage = createLazyComponent(() => import('../../pages/Vocabulary'), 'VocabularyPage');
const QuickPracticePage = createLazyComponent(() => import('../../pages/Practice/QuickPractice'), 'QuickPracticePage');
const TimedPracticePage = createLazyComponent(() => import('../../pages/Practice/TimedPractice'), 'TimedPracticePage');
const ReviewPracticePage = createLazyComponent(() => import('../../pages/Practice/ReviewPractice'), 'ReviewPracticePage');
const AllVocabularyPage = createLazyComponent(() => import('../../pages/Vocabulary/AllVocabulary'), 'AllVocabularyPage');
const FavoriteVocabularyPage = createLazyComponent(() => import('../../pages/Vocabulary/FavoriteVocabulary'), 'FavoriteVocabularyPage');
const LearningVocabularyPage = createLazyComponent(() => import('../../pages/Vocabulary/LearningVocabulary'), 'LearningVocabularyPage');
const MasteredVocabularyPage = createLazyComponent(() => import('../../pages/Vocabulary/MasteredVocabulary'), 'MasteredVocabularyPage');
const PageLoadingFallback = ({ pageName }) => (_jsx(Box, { minH: "100vh", bg: "gray.50", children: _jsxs(VStack, { spacing: 6, justify: "center", minH: "100vh", children: [_jsx(LoadingSkeleton, { type: "card", repeat: 1 }), _jsxs(VStack, { spacing: 2, children: [_jsx(Spinner, { size: "lg", color: "blue.500", thickness: "4px" }), _jsx(Text, { color: "gray.600", fontSize: "sm", children: pageName ? `正在加载${pageName}...` : '正在加载页面...' })] })] }) }));
const preloadRoutes = {
    preloadMainPages: () => {
        preloadComponent(() => import('../../pages/Home'));
        preloadComponent(() => import('../../pages/Practice'));
        preloadComponent(() => import('../../pages/Progress'));
    },
    preloadPracticePages: () => {
        preloadComponent(() => import('../../pages/Practice/QuickPractice'));
        preloadComponent(() => import('../../pages/Practice/TimedPractice'));
        preloadComponent(() => import('../../pages/Practice/ReviewPractice'));
    },
    preloadVocabularyPages: () => {
        preloadComponent(() => import('../../pages/Vocabulary/AllVocabulary'));
        preloadComponent(() => import('../../pages/Vocabulary/FavoriteVocabulary'));
        preloadComponent(() => import('../../pages/Vocabulary/LearningVocabulary'));
        preloadComponent(() => import('../../pages/Vocabulary/MasteredVocabulary'));
    },
};
const useRoutePreloading = () => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            preloadRoutes.preloadMainPages();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    const preloadOnHover = React.useCallback((routeType) => {
        return () => {
            preloadRoutes[routeType]();
        };
    }, []);
    return { preloadOnHover };
};
const OptimizedRouter = () => {
    const { preloadOnHover } = useRoutePreloading();
    return (_jsx(ErrorBoundary, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u9996\u9875" }), children: _jsx(HomePage, {}) }) }), _jsx(Route, { path: "/practice", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u7EC3\u4E60" }), children: _jsx(PracticePage, {}) }) }), _jsx(Route, { path: "/practice/quick", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u5FEB\u901F\u7EC3\u4E60" }), children: _jsx(QuickPracticePage, {}) }) }), _jsx(Route, { path: "/practice/timed", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u8BA1\u65F6\u7EC3\u4E60" }), children: _jsx(TimedPracticePage, {}) }) }), _jsx(Route, { path: "/practice/review", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u590D\u4E60\u7EC3\u4E60" }), children: _jsx(ReviewPracticePage, {}) }) }), _jsx(Route, { path: "/progress", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u5B66\u4E60\u8FDB\u5EA6" }), children: _jsx(ProgressPage, {}) }) }), _jsx(Route, { path: "/vocabulary", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u8BCD\u6C47\u7BA1\u7406" }), children: _jsx(VocabularyPage, {}) }) }), _jsx(Route, { path: "/vocabulary/all", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u6240\u6709\u8BCD\u6C47" }), children: _jsx(AllVocabularyPage, {}) }) }), _jsx(Route, { path: "/vocabulary/favorites", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u6536\u85CF\u8BCD\u6C47" }), children: _jsx(FavoriteVocabularyPage, {}) }) }), _jsx(Route, { path: "/vocabulary/learning", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u5B66\u4E60\u4E2D\u8BCD\u6C47" }), children: _jsx(LearningVocabularyPage, {}) }) }), _jsx(Route, { path: "/vocabulary/mastered", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u5DF2\u638C\u63E1\u8BCD\u6C47" }), children: _jsx(MasteredVocabularyPage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(Suspense, { fallback: _jsx(PageLoadingFallback, { pageName: "\u8BBE\u7F6E" }), children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Center, { minH: "100vh", children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontSize: "6xl", color: "gray.400", children: "404" }), _jsx(Text, { fontSize: "xl", color: "gray.600", children: "\u9875\u9762\u672A\u627E\u5230" })] }) }) })] }) }));
};
export default OptimizedRouter;
export { preloadRoutes };
