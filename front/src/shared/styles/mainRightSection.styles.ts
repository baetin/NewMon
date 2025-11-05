import styled from "styled-components";

export const MainRightSectionStyles = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;

  h3 {
    margin-bottom: 12px;
    font-size: 1.1rem;
    font-weight: bold;
  }
  p {
    position: absolute;
    right: 20px;
    bottom: 1px;
    color: ${({ theme }) => theme.colors.text.sub};
    font-size: 0.8rem;
  }
`;
