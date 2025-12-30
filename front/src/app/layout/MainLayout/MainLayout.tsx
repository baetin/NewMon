import { useState } from 'react';

import { Outlet } from 'react-router-dom';

import { MainNavbar, MobileNavbar } from '@/app/layout/Navbar';
import { Footer } from '@/shared/ui';

import { Container, Main } from './MainLayout.styles';

export const MainLayout = () => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <Container onClick={() => setIsClicked(false)}>
      <MainNavbar isClicked={isClicked} setIsClicked={setIsClicked} />
      <MobileNavbar />

      <Main>
        <Outlet />
      </Main>

      <Footer />
    </Container>
  );
};
