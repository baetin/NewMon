import { lazy, Suspense } from "react";
import { Spinner } from "../../shared/ui";
import { MainLayout } from "../../widgets/layouts";
import { createBrowserRouter } from "react-router-dom";

// 페이지 lazy import
const HomePage = lazy(() => import("../../pages/Home/ui/HomePage"));
const LoginPage = lazy(() => import("../../pages/Login/LoginPage"));
const NotFoundPage = lazy(() => import("../../pages/NotFound/NotFoundPage"));

// Suspense 래퍼
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
);

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [{ path: "", element: withSuspense(HomePage) }],
  },
  { path: "/login", element: withSuspense(LoginPage) },
  { path: "*", element: withSuspense(NotFoundPage) },
]);
