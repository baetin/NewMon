import { Outlet } from "react-router-dom";
import { Container, Main } from "./MainLayout.styles";
import { Footer } from "../../../shared/ui";
import { useEffect, useState } from "react";
import { MainNavbar } from "../../Navbar/ui/MainNavbar";
import { useSetRecoilState } from "recoil";
import { LoginUserState } from "../../../shared/model/loginUserState";
import { useSessionCheckQuery } from "../hooks/useSessionCheckQuery";

export const MainLayout = () => {
  const [isClicked, setIsClicked] = useState(false);
  const setLoginUser = useSetRecoilState(LoginUserState);
  const { data: sessionData } = useSessionCheckQuery();

  // if (isError) alert("세션이 만료되었습니다.");

  useEffect(() => {
    if (!sessionData) return;

    if (!sessionData.isAuthenticated) {
      setLoginUser({ userId: 0, displayName: "", isNewUser: null });
      return;
    }

    setLoginUser((prev) => ({
      userId: sessionData.userId,
      displayName: sessionData.displayName || "유저",
      isNewUser: prev.isNewUser,
    }));
  }, [sessionData]);

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
