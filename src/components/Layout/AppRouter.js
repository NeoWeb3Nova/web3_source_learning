import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { Layout } from './Layout';
const HomePage = React.lazy(() => import('@/pages/Home'));
const VocabularyPage = React.lazy(() => import('@/pages/Vocabulary'));
const PracticePage = React.lazy(() => import('@/pages/Practice'));
const ProgressPage = React.lazy(() => import('@/pages/Progress'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));
const RefreshablePage = React.lazy(() => import('@/components/pages/RefreshablePage'));
const ErrorHandlingDemo = React.lazy(() => import('@/components/pages/ErrorHandlingDemo'));
const AllVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/AllVocabulary'));
const FavoriteVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/FavoriteVocabulary'));
const MasteredVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/MasteredVocabulary'));
const LearningVocabularyPage = React.lazy(() => import('@/pages/Vocabulary/LearningVocabulary'));
const QuickPracticePage = React.lazy(() => import('@/pages/Practice/QuickPractice'));
const TimedPracticePage = React.lazy(() => import('@/pages/Practice/TimedPractice'));
const ReviewPracticePage = React.lazy(() => import('@/pages/Practice/ReviewPractice'));
const LoadingFallback = () => (_jsx(Center, { h: "200px", children: _jsxs(VStack, { spacing: 4, children: [_jsx(Spinner, { thickness: "4px", speed: "0.65s", emptyColor: "gray.200", color: "primary.500", size: "xl" }), _jsx(Text, { color: "gray.600", fontSize: "sm", children: "\u9875\u9762\u52A0\u8F7D\u4E2D..." })] }) }));
const NotFoundPage = () => (_jsx(Center, { h: "400px", children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontSize: "6xl", fontWeight: "bold", color: "gray.400", children: "404" }), _jsx(Text, { fontSize: "xl", color: "gray.600", children: "\u9875\u9762\u672A\u627E\u5230" }), _jsx(Text, { color: "gray.500", textAlign: "center", children: "\u60A8\u8BBF\u95EE\u7684\u9875\u9762\u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5URL\u662F\u5426\u6B63\u786E" })] }) }));
const routeConfig = [
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
const renderRoutes = (routes) => {
    return routes.map((route) => {
        const Element = route.element;
        if (route.children) {
            return (_jsxs(Route, { path: route.path, element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(Element, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: route.children[0].path, replace: true }) }), renderRoutes(route.children)] }, route.path));
        }
        return (_jsx(Route, { path: route.path, element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(Element, {}) }) }, route.path));
    });
};
export const AppRouter = () => {
    return (_jsx(Layout, { children: _jsxs(Routes, { children: [renderRoutes(routeConfig), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
};
export default AppRouter;
