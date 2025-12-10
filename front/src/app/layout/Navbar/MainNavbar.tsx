// src/app/layout/Navbar/MainNavbar.tsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useQueryClient } from "@tanstack/react-query";

import mainLogo from "@/shared/assets/mainLogo.png";
import { topics } from "@/shared/model/topics";
import { LoginUserState } from "@/shared/model/loginUserState";

import { useLogoutMutation } from "@/widgets/Navbar/hooks/useLogoutMutation";
import { useSessionCheckQuery } from "@/features/auth/hooks/useSessionCheckQuery";

import { SearchBar } from "@/features/searchBar/ui/SearchBar";
import {
  Container,
  LeftSection,
  Logo,
  CenterSection,
  NavItem,
  RightSection,
  LoginButton,
  UserNameControllContainer,
  SelectDropDownContainer,
} from "./MainNavbar.styles";

interface IsClickedProps {
  isClicked: boolean;
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MainNavbar = ({ isClicked, setIsClicked }: IsClickedProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const setLoginUser = useSetRecoilState(LoginUserState);
  const queryClient = useQueryClient();

  const { mutate: logoutMutate, isPending } = useLogoutMutation();
  const { data: sessionData, isPending: isSessionPending } =
    useSessionCheckQuery();

  const onClick = () => setIsClicked((prev) => !prev);

  const onLogoutClick = () => {
    const result = confirm("로그아웃 하시겠습니까?");
    if (!result) return;

    logoutMutate(undefined, {
      onSuccess: () => {
        setLoginUser({ userId: 0, displayName: "", isNewUser: null });
        queryClient.clear();
        navigate("/");
      },
      onError: () => {
        alert("로그아웃 중 오류가 발생했습니다.");
      },
    });
  };

  const onChangeInfoClick = () => navigate("/change-user-info");

  return (
    <Container>
      {/* Left: Logo */}
      <LeftSection>
        <Logo src={mainLogo} alt="Main Logo" onClick={() => navigate("/")} />
      </LeftSection>

      {/* Center: Category Menu */}
      <CenterSection>
        {topics.map((topic) => (
          <NavItem
            as={Link}
            key={topic.value}
            to={`/news/${topic.value}`}
            className={
              location.pathname === `/news/${topic.value}` ? "active" : ""
            }
          >
            {topic.label}
          </NavItem>
        ))}
      </CenterSection>

      {/* Right: Search + Auth Menu */}
      <RightSection>
        {location.pathname.startsWith("/news") && <SearchBar />}

        {!sessionData?.isAuthenticated && (
          <LoginButton onClick={() => navigate("/login")}>로그인</LoginButton>
        )}

        {!isSessionPending && sessionData?.isAuthenticated && (
          <>
            <UserNameControllContainer
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <span>{sessionData.displayName}님</span>
            </UserNameControllContainer>

            {isClicked && (
              <SelectDropDownContainer onClick={(e) => e.stopPropagation()}>
                <p onClick={onLogoutClick}>
                  {isPending ? "로그아웃 중..." : "로그아웃"}
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
