import type { JSX } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { Spinner } from '@/shared/ui';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isPending } = useAuth();
  if (isPending) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to={'/login'} replace />;
  }
  return children;
};
