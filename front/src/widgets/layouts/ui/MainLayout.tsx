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
      const user = result?.user || null;
      setLoginUser(user || { userId: "", displayName: "", isNewUser: null }); // Recoil 사용해서 저장
      console.log("세션 체크 결과:", result);
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
