import styled from "styled-components";

export const ArticleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
`;

export const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
`;

export const Contents = styled.div`
  padding: 20px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
`;

export const Title = styled.h2`
  margin: 12px 0 8px;
  font-size: 1.5rem;
  color: #333;
`;

export const Summary = styled.div`
  color: ${({ theme }) => theme.colors.text.sub};
  font-size: 1rem;
  max-height: 180px;
  overflow-y: auto;
`;
