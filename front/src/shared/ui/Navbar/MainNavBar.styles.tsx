import styled from "styled-components";

export const Logo = styled.img`
  height: 80px;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const ButtonBase = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 25px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.light};
  cursor: pointer;
  transition: all 0.3s ease;
`;

export const LoginButton = styled(ButtonBase)`
  background-color: #162733;

  &:hover {
    transition: all 0.3s ease;
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;
