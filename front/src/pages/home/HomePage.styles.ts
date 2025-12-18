import styled from "styled-components";

export const TabWrapper = styled.div`
  display: flex;
  gap: 12px;
  margin-left: 65px;
  margin-bottom: 24px;
`;

export const Tab = styled.div<{ $active?: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  border-radius: 10px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${(props) => (props.$active ? "#fff" : "#666")};

  &:hover {
    background: ${(props) => (props.$active ? "#111" : "#f1f1f1")};
  }
`;
