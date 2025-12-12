import { Outlet } from "react-router-dom";
import { useState } from "react";

import { Container, Main } from "./MainLayout.styles";

import { MainNavbar } from "@/app/layout/Navbar";
import { Footer } from "@/shared/ui";

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
