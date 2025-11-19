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

      const user = result.user
        ? {
            userId: result.user.userId,
            displayName: result.user.displayName,
            isNewUser: false,
          }
        : { userId: result.userId, displayName: "유저", isNewUser: false };

      setLoginUser(user);
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
