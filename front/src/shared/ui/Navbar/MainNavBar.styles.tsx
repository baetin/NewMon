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
  display: flex;
  align-items: center;
  gap: 14px;
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
