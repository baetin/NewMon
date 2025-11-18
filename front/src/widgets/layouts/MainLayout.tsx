import { Outlet } from "react-router-dom";
import { Container, Main } from "./MainLayout.styles";
import { MainNavbar, Footer } from "../../shared/ui";
import { useState } from "react";

export const MainLayout = () => {
  const [isClicked, setIsClicked] = useState(false);
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
