import styled from 'styled-components';

export const Container = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.sub};
  display: none;
  ${({ theme }) => theme.media.mobileDown} {
    display: block;
  }
`;

export const TopBar = styled.div<{ $isNewsPath: boolean }>`
  position: relative;
  height: 56px;
  padding: 0 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  color: ${({ theme }) => theme.colors.text.main};

  &:active {
    opacity: 0.7;
  }
`;

export const Logo = styled.img`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  height: 75px;
  cursor: pointer;
`;

export const SearchOverlay = styled.div`
  position: fixed;
  inset: 0;

  background: transparent;
  z-index: 1050;
`;

export const SearchExpandContainer = styled.div`
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;

  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.background};

  border-bottom: 1px solid ${({ theme }) => theme.colors.text.sub};
  z-index: 1100;
`;

export const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;

  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1100;
`;

export const DrawerContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;

  width: 260px;
  height: 100vh;

  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

  padding: 20px 16px;

  display: flex;
  flex-direction: column;
  gap: 24px;

  z-index: 1200;
`;

export const DrawerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DrawerItem = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  padding: 8px 0;

  text-align: left;
  font-size: 16px;
  font-weight: 500;

  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.text.sub : theme.colors.text.main};

  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  &:hover {
    color: ${({ theme, disabled }) =>
      disabled ? null : theme.colors.secondary};
  }

  &.active {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;
