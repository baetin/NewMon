import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
`;

export const CircleButton = styled.button<{ $move: boolean }>`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $move }) => ($move ? "translateY(-3px)" : "translateY(3px)")};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const SubArticleWrapper = styled.div`
  margin-top: 12px;
  width: 100%;
  background: #${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
