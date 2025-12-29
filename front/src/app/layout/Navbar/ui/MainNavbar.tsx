import { useQueryClient } from '@tanstack/react-query';
import { FaSignInAlt } from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth, useLogoutMutation } from '@/features/auth';
import { SearchBar } from '@/features/searchBar';
import mainLogo from '@/shared/assets/mainLogo.png';
import { topics } from '@/shared/model/topics';

import {
  CenterSection,
  Container,
  LeftSection,
  LoginButton,
  Logo,
  NavItem,
  RightSection,
  SelectDropDownContainer,
  UserNameControllContainer,
} from './MainNavbar.styles';

interface IsClickedProps {
  isClicked: boolean;
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MainNavbar = ({ isClicked, setIsClicked }: IsClickedProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isAuthenticated, displayName } = useAuth();
  const { mutate: logoutMutate, isPending } = useLogoutMutation();

  const onClick = () => setIsClicked((prev) => !prev);

  const onLogoutClick = () => {
    const result = confirm('로그아웃 하시겠습니까?');

    if (!result) return;

    logoutMutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(['session'], {
          isAuthenticated: false,
          displayName: '',
          userId: 0,
        });
        navigate('/');
      },
      onError: () => {
        alert('로그아웃 중 오류가 발생했습니다.');
      },
    });
  };

  const onChangeInfoClick = () => navigate('/change-user-info');

  const isNewsPath = location.pathname.startsWith('/news');
  return (
    <Container>
      {/* Left: Logo */}
      <LeftSection>
        <Logo src={mainLogo} alt="Main Logo" onClick={() => navigate('/')} />
      </LeftSection>

      {/* Center: Category Menu */}
      <CenterSection>
        {topics.map((topic) => (
          <NavItem
            as={Link}
            key={topic.value}
            to={`/news/${topic.value}`}
            className={
              location.pathname === `/news/${topic.value}` ? 'active' : ''
            }
          >
            {topic.label}
          </NavItem>
        ))}
      </CenterSection>

      {/* Right: Search + Auth Menu */}

      <RightSection $isNewsPath={isNewsPath}>
        {isNewsPath && <SearchBar />}

        {!isAuthenticated && (
          <LoginButton onClick={() => navigate('/login')}>
            <FaSignInAlt size={16} />
            로그인
          </LoginButton>
        )}

        {isAuthenticated && (
          <>
            <UserNameControllContainer
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <span>{displayName}님</span>
              <IoMdArrowDropdown size={30} />
            </UserNameControllContainer>

            {isClicked && (
              <SelectDropDownContainer onClick={(e) => e.stopPropagation()}>
                <p onClick={onLogoutClick}>
                  {isPending ? '로그아웃 중...' : '로그아웃'}
                </p>
                <p onClick={onChangeInfoClick}>정보 수정</p>
              </SelectDropDownContainer>
            )}
          </>
        )}
      </RightSection>
    </Container>
  );
};
