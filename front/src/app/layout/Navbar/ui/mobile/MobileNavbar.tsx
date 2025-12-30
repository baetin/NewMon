import { useState } from 'react';

import { FiSearch } from 'react-icons/fi';
import { RxHamburgerMenu } from 'react-icons/rx';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth, useLogoutMutation } from '@/features/auth';
import { SearchBar } from '@/features/searchBar';
import mainLogo from '@/shared/assets/mainLogo.png';
import { queryClient } from '@/shared/lib';
import { topics } from '@/shared/model/topics';

import {
  Container,
  DrawerContainer,
  DrawerItem,
  DrawerOverlay,
  DrawerSection,
  IconButton,
  Logo,
  SearchExpandContainer,
  SearchOverlay,
  TopBar,
} from './MobileNavbar.styles';

export const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, displayName } = useAuth();
  const { mutate: logoutMutate } = useLogoutMutation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isNewsPath = location.pathname.startsWith('/news');

  const openDrawer = () => {
    setIsSearchOpen(false);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const toggleSearch = () => {
    setIsDrawerOpen(false);
    setIsSearchOpen((prev) => !prev);
  };

  const onLogout = () => {
    const result = confirm('로그아웃 하시겠습니까?');

    if (!result) return;

    logoutMutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(['session'], {
          isAuthenticated: false,
          displayName: '',
          userId: 0,
        });
        setIsDrawerOpen(false);
        navigate('/');
      },
      onError: () => {
        alert('로그아웃 중 오류가 발생했습니다.');
      },
    });
  };

  return (
    <Container>
      {/* 상단 바 */}
      <TopBar $isNewsPath={isNewsPath}>
        <IconButton onClick={openDrawer}>
          <RxHamburgerMenu size={22} />
        </IconButton>

        <Logo src={mainLogo} alt="logo" onClick={() => navigate('/')} />

        {isNewsPath && (
          <IconButton onClick={toggleSearch}>
            <FiSearch size={22} />
          </IconButton>
        )}
      </TopBar>

      {/* 검색 상단 확장 */}
      {isNewsPath && isSearchOpen && (
        <>
          <SearchOverlay onClick={() => setIsSearchOpen(false)} />

          <SearchExpandContainer onClick={(e) => e.stopPropagation()}>
            <SearchBar autoFocus={true} />
          </SearchExpandContainer>
        </>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <DrawerOverlay onClick={closeDrawer} />
          <DrawerContainer>
            <DrawerSection>
              {topics.map((topic) => (
                <DrawerItem
                  key={topic.value}
                  className={
                    location.pathname === `/news/${topic.value}` ? 'active' : ''
                  }
                  onClick={() => {
                    navigate(`/news/${topic.value}`);

                    closeDrawer();
                  }}
                >
                  {topic.label}
                </DrawerItem>
              ))}
            </DrawerSection>

            <DrawerSection>
              {!isAuthenticated && (
                <DrawerItem onClick={() => navigate('/login')}>
                  로그인
                </DrawerItem>
              )}

              {isAuthenticated && (
                <>
                  <DrawerItem disabled>{displayName}님</DrawerItem>
                  <DrawerItem onClick={onLogout}>로그아웃</DrawerItem>
                </>
              )}
            </DrawerSection>
          </DrawerContainer>
        </>
      )}
    </Container>
  );
};
