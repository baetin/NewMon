import { Outlet } from "react-router-dom";
import { Container, Main } from "./MainLayout.styles";
import { Footer } from "../../../shared/ui";
import { useEffect, useState } from "react";
import { MainNavbar } from "../../Navbar/ui/MainNavbar";
import { handleSessionCheck } from "../api/handleSessionCheck";
import { useSetRecoilState } from "recoil";
import { LoginUserState } from "../../../shared/model/loginUserState";

export const MainLayout = () => {
  const [isClicked, setIsClicked] = useState(false);
  const setLoginUser = useSetRecoilState(LoginUserState);

  useEffect(() => {
    const checkSession = async () => {
      const result = await handleSessionCheck();

      if (!result?.isAuthenticated) {
        setLoginUser({ userId: "", displayName: "", isNewUser: null });
        return;
      }

      setLoginUser((prev) => ({
        // 세션 체크 시 displayName이 없으면 이전 Recoil 값 유지
        ...prev,
        userId: result.user?.userId || result.userId,
      }));
    };

    checkSession();
  }, []);

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
