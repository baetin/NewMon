import { Link } from "react-router-dom";
import styled from "styled-components";

export const Container = styled.nav`
  display: flex;
  max-height: 100px;
  align-items: center;
  justify-content: space-around;
  padding: 12px 40px;
  background-color: ${({ theme }) =>
    `${theme.colors.background}CC`}; /* 투명도 80% 정도 */

  backdrop-filter: blur(12px); /* 배경 콘텐츠 블러 */
  -webkit-backdrop-filter: blur(12px); /* Safari 호환용 */

  border-bottom: 1px solid ${({ theme }) => theme.colors.text.sub};
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const LeftSection = styled.a`
  display: flex;
  align-items: center;
`;

export const Logo = styled.img`
  height: 100px;
`;

export const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
`;

export const NavItem = styled(Link)`
  position: relative;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -3px;
    width: 100%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.secondary};
    transform: translateX(-50%) scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(-50%) scaleX(1);
  }

  &.active::after {
    transform: translateX(-50%) scaleX(1);
  }

  &.active {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const RightSection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const UserNameControllContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
`;

export const SelectDropDownContainer = styled.div`
  position: absolute; /* 부모를 기준으로 위치 지정 */
  top: 100%; /* 버튼 바로 아래에 나타나게 */
  /* right: 0; */
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 120px;
  z-index: 1000;

  p {
    margin: 0;
    padding: 8px 16px;
    cursor: pointer;
    &:hover {
      background-color: #f2f2f2;
    }
  }
`;
export const ButtonBase = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 25px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.light};
  cursor: pointer;
  transition: all 0.3s ease;
`;

export const LoginButton = styled(ButtonBase)`
  background-color: #162733;

  &:hover {
    transition: all 0.3s ease;
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;
