import styled, { keyframes } from "styled-components";

export const Spinner = () => <Loader />;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div`
  border: 6px solid #f3f3f3;
  border-top: 6px solid #162733;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
  margin: 200px auto;
`;
