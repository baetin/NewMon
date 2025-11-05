import styled from "styled-components";
import { MainRightSectionStyles } from "../../../../shared/styles/mainRightSection.styles";

export const HotTopicContainer = styled(MainRightSectionStyles)`
  position: relative;

  ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }
`;
