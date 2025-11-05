import styled from "styled-components";
import { motion } from "framer-motion";

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
`;

export const Texts = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  min-width: 0;
  padding-right: 20px;
`;

export const Summary = styled.p`
  font-size: 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
`;

export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

export const Image = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
`;
