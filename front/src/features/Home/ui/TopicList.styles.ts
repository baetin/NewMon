import styled from 'styled-components';

import { MainRightSectionStyles } from '@/shared/styles/mainRightSection.styles';

export const TopicContainer = styled(MainRightSectionStyles)`
  position: relative;

  p {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;
export const TopicItem = styled.li<{ $active: boolean }>`
  font-size: 0.95rem;
  color: ${({ theme, $active }) => ($active ? theme.colors.secondary : '#333')};
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  transition: color 0.2s ease;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  ${({ theme }) => theme.media.tabletDown} {
    font-size: 0.825rem;
  }
`;
