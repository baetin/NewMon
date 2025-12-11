import styled, { css } from "styled-components";

export const DiffWordContainer = styled.span<{
  $added?: boolean;
  $removed?: boolean;
}>`
  ${({ $added }) =>
    $added &&
    css`
      background-color: yellow;
    `}

  ${({ $removed }) =>
    $removed &&
    css`
      background-color: #ffc8c8;
      opacity: 0.6;
      text-decoration: line-through;
    `}
`;
