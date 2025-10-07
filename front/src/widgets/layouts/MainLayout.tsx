import { Outlet } from "react-router-dom";
import { Container, Main } from "./MainLayout.styles";
import { MainNavbar } from "../../shared/ui";

export const MainLayout = () => {
  return (
    <Container>
      <MainNavbar />
      <Main>
        <Outlet />
      </Main>
      {/* <Footer /> */}
    </Container>
  );
};
