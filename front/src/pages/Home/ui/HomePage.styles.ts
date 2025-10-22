import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 20px;
`;

export const Left = styled.div`
  /* flex: 1.5; */
`;

export const Right = styled.div`
  /* flex: 1; */
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
