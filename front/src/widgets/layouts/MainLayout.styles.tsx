import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.mainBackground};
`;

export const Main = styled.main`
  flex: 1;
  padding: 20px;
`;
