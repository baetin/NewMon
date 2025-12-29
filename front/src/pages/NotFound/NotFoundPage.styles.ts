import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  color: #162733;
`;

export const Title = styled.h1`
  font-size: 96px;
  font-weight: 700;
  margin-bottom: 20px;
`;

export const Message = styled.p`
  font-size: 20px;
  margin-bottom: 32px;
`;

export const StyledLink = styled(Link)`
  padding: 10px 20px;
  background-color: #162733;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #fa9675;
  }
`;
