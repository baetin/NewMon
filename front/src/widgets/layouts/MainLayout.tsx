import { Outlet } from "react-router-dom";
import { Container, Main } from "./MainLayout.styles";
import { Footer } from "../../shared/ui";
import { useState } from "react";
import { MainNavbar } from "../Navbar/ui/MainNavbar";

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
