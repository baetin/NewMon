import styled, { css } from 'styled-components';

export const TopicContainer = styled.div<{ $variant: 'home' | 'topics' }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;

  ${({ theme }) => theme.media.tabletDown} {
    gap: 20px;
    padding: 32px 20px;
  }

  ${({ theme }) => theme.media.mobileDown} {
    flex-direction: column;
    gap: 16px;
    padding: 24px 12px;
    margin: 0 auto;
  }

  ${({ $variant, theme }) =>
    $variant === 'home' &&
    css`
      ${theme.media.mobileDown} {
        & > aside {
          display: none;
        }
      }
    `}
`;

export const Left = styled.div`
  flex: 3;
  min-width: 0;
`;

export const TopicsLeft = styled.div`
  flex: 1.3;
  min-width: 0;
`;

export const Right = styled.aside`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
