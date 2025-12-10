import type { JSX } from "react";
import { useSessionCheckQuery } from "../../shared/hoooks/useSessionCheckQuery";
import { Spinner } from "../../shared/ui";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { data, isFetching, isError } = useSessionCheckQuery();
  if (isFetching) return <Spinner />;

  if (isError || !data?.isAuthenticated) {
    return (
      <>
        {alert("로그인이 필요한 서비스 입니다. 로그인 페이지로 이동합니다.")}
        <Navigate to={"/login"} replace />
      </>
    );
  }
  return children;
};
