import { motion } from 'framer-motion';
import styled from 'styled-components';

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  min-width: 0;
`;

export const SubArticle = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: none;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  cursor: pointer;

  ${({ theme }) => theme.media.tabletDown} {
    padding: 14px 16px;
  }

  ${({ theme }) => theme.media.mobileDown} {
    padding: 12px;
    gap: 12px;
  }
`;

export const Texts = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-right: 20px;
`;

export const Summary = styled.p`
  font-size: 1rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.sub};

  ${({ theme }) => theme.media.tabletDown} {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  ${({ theme }) => theme.media.mobileDown} {
    -webkit-line-clamp: 1;
    font-size: 0.95rem;
  }
`;

export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 4px;

  ${({ theme }) => theme.media.mobileDown} {
    font-size: 1.05rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export const Image = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  flex-shrink: 0;

  ${({ theme }) => theme.media.tabletDown} {
    width: 80px;
    height: 80px;
  }

  ${({ theme }) => theme.media.mobileDown} {
    width: 64px;
    height: 64px;
  }
`;
