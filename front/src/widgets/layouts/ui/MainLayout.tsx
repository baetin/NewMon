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
  const [, setUser] = useState(null);
  const setLoginUser = useSetRecoilState(LoginUserState);

  useEffect(() => {
    const checkSession = async () => {
      const result = await handleSessionCheck();
      const user = result?.user || null;
      setUser(user); // 로컬 state
      setLoginUser(user || { userId: "", displayName: "", isNewUser: null }); // Recoil 사용해서 저장
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
