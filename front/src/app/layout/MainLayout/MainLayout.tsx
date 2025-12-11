import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

import { Container, Main } from "./MainLayout.styles";

import { LoginUserState } from "@/shared/model/loginUserState";
import { useSessionCheckQuery } from "@/features/auth/hooks/useSessionCheckQuery";

import { MainNavbar } from "@/app/layout/Navbar";
import { Footer } from "@/shared/ui";

export const MainLayout = () => {
  const [isClicked, setIsClicked] = useState(false);
  const setLoginUser = useSetRecoilState(LoginUserState);
  const { data: sessionData } = useSessionCheckQuery();

  useEffect(() => {
    if (!sessionData) return;

    if (!sessionData.isAuthenticated) {
      setLoginUser({ userId: 0, displayName: "", isNewUser: null });
    } else {
      setLoginUser((prev) => ({
        userId: sessionData.userId,
        displayName: sessionData.displayName || "유저",
        isNewUser: prev.isNewUser,
      }));
    }
  }, [sessionData, setLoginUser]);

  return (
    <Container onClick={() => setIsClicked(false)}>
      <MainNavbar isClicked={isClicked} setIsClicked={setIsClicked} />

      <Main>
        <Outlet />
      </Main>

      <Footer />
    </Container>
  );
};
