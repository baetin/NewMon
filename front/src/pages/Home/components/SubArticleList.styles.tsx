import styled from "styled-components";

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SubArticle = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Image = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
`;

export const Texts = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h4`
  font-size: 1.25rem;
  color: #162733;
`;
export const Summary = styled.p`
  font-size: 1rem;
`;
