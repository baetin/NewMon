import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const NavButton = styled.button`
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &:not(:disabled):hover {
    background: #f2f2f2;
    transition: 0.2s;
  }
`;

export const PageText = styled.span`
  font-size: 16px;
  font-weight: 600;
`;
