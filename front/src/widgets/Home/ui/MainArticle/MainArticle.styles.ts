import styled from "styled-components";

export const ArticleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
`;

export const Summary = styled.p`
  font-size: 1rem;
  color: #555;
`;

export const CompareBox = styled.div`
  background: #f9f9f9;
  border-radius: 10px;
  padding: 12px;
  font-size: 0.9rem;
`;
