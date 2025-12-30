import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ButtonBase } from '@/shared/styles/button.styles';

export const Container = styled.nav`
  display: flex;
  max-height: 100px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 40px;
  background-color: ${({ theme }) => `${theme.colors.background}CC`};

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari 호환용 */

  border-bottom: 1px solid ${({ theme }) => theme.colors.text.sub};
  position: sticky;
  top: 0;
  z-index: 9999;

  ${({ theme }) => theme.media.tabletDown} {
    height: 85px;
  }
  ${({ theme }) => theme.media.mobileDown} {
    display: none;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

export const Logo = styled.img`
  height: 100px;
  cursor: pointer;

  ${({ theme }) => theme.media.tabletDown} {
    height: 70px;
  }
`;

export const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
  flex: 1;
  justify-content: center;

  flex-wrap: nowrap;
  white-space: nowrap;
`;

export const NavItem = styled(Link)`
  position: relative;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  &::after {
    content: '';
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
  ${({ theme }) => theme.media.tabletDown} {
    font-size: 0.8rem;
  }
`;

export const RightSection = styled.div<{ $isNewsPath: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  justify-content: ${(props) => (props.$isNewsPath ? 'baseline' : 'center')};
`;

export const UserNameControllContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  ${({ theme }) => theme.media.tabletDown} {
    span {
      font-size: 0.8rem;
    }
  }
`;

export const SelectDropDownContainer = styled.div`
  position: absolute;
  top: 100%;
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

export const LoginButton = styled(ButtonBase)`
  background-color: #162733;
  color: ${({ theme }) => theme.colors.text.light};

  &:hover {
    transition: all 0.3s ease;
    background-color: ${({ theme }) => theme.colors.secondary};
  }

  ${({ theme }) => theme.media.tabletDown} {
    font-size: 0.8rem;
  }
`;
