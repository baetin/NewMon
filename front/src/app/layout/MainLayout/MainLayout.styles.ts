import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.mainBackground};
`;

export const Main = styled.main`
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;

  ${({ theme }) => theme.media.tabletDown} {
    max-width: 100%;
    padding: 20px 16px;
  }

  ${({ theme }) => theme.media.mobileDown} {
    padding: 16px 12px;
  }
`;

export const DesktopOnly = styled.div`
  ${({ theme }) => theme.media.mobileDown} {
    display: none;
  }
`;

export const MobileOnly = styled.div`
  display: none;

  ${({ theme }) => theme.media.mobileDown} {
    display: block;
  }
`;
