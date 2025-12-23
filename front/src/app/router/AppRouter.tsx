import { Suspense, lazy } from 'react';

import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/app/layout/MainLayout/MainLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { ScrollToTopPage, Spinner } from '@/shared/ui';

// 페이지 lazy import

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const TopicsHomePage = lazy(() => import('@/pages/topicsHome/TopicsHomePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const InterestSelectPage = lazy(
  () => import('@/pages/interestSelect/InterestSelectPage')
);

const NotFoundPage = lazy(() => import('@/pages/notFound/NotFoundPage'));

// Suspense 래퍼
const SuspenseWrapper = (Component: React.LazyExoticComponent<any>) => {
  return (
    <Suspense fallback={<Spinner />}>
      <Component />
    </Suspense>
  );
};

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <ScrollToTopPage />
        <MainLayout />
      </>
    ),
    children: [
      { index: true, element: SuspenseWrapper(HomePage) },
      { path: 'news/:topic', element: SuspenseWrapper(TopicsHomePage) },
    ],
  },
  {
    path: '/login',
    element: SuspenseWrapper(LoginPage),
  },
  {
    path: '/interest-select',
    element: (
      <ProtectedRoute>{SuspenseWrapper(InterestSelectPage)}</ProtectedRoute>
    ),
  },
  {
    path: '/change-user-info',
    element: (
      <ProtectedRoute>{SuspenseWrapper(InterestSelectPage)}</ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: SuspenseWrapper(NotFoundPage),
  },
]);
