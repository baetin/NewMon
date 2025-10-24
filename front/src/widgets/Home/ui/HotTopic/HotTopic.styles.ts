import styled from "styled-components";

export const HotTopicContainer = styled.div`
  position: relative;
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);

  h3 {
    margin-bottom: 12px;
    font-size: 1.1rem;
    font-weight: bold;
  }

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
  p {
    position: absolute;
    right: 20px;
    bottom: 2px;
    color: ${({ theme }) => theme.colors.text.sub};
    font-size: 0.8rem;
  }
`;
