import styled from "styled-components";

export const FooterContainer = styled.footer`
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.sub};
  padding: 40px 0;
  text-align: center;
  font-size: 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colors.text.sub};
`;

export const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.text.sub};
  margin: 0 10px;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
