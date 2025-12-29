import styled from 'styled-components';

import { ButtonBase } from '../../../shared/styles/button.styles';

export const SearchContainer = styled(ButtonBase)`
  background-color: white;
  color: black;
  border: 2px solid transparent;
  cursor: auto;
  input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 1rem;
  }
  &:has(input:focus) {
    border: 2px solid #000;
  }
`;
