import { lazy, Suspense } from "react";
import { Spinner } from "../../shared/ui";
import { MainLayout } from "../../widgets/layouts";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// 페이지 lazy import

const HomePage = lazy(() => import("@/pages/Home/ui/HomePage"));
const TopicsHomePage = lazy(
  () => import("@/pages/TopicsHome/ui/TopicsHomePage")
);
const LoginPage = lazy(() => import("@/pages/Login/LoginPage"));
const InterestSelectPage = lazy(
  () => import("@/pages/InterestSelect/ui/InterestSelect")
);

const NotFoundPage = lazy(() => import("@/pages/NotFound/NotFoundPage"));

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
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: SuspenseWrapper(HomePage) },
      { path: "news/:topic", element: SuspenseWrapper(TopicsHomePage) },
    ],
  },
  {
    path: "/login",
    element: SuspenseWrapper(LoginPage),
  },
  {
    path: "/interest-select",
    element: (
      <ProtectedRoute>{SuspenseWrapper(InterestSelectPage)}</ProtectedRoute>
    ),
  },
  {
    path: "/change-user-info",
    element: (
      <ProtectedRoute>{SuspenseWrapper(InterestSelectPage)}</ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: SuspenseWrapper(NotFoundPage),
  },
]);
