import styled from "styled-components";
import { Link } from "react-router-dom";
import type React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <Container>
      <Title>404</Title>
      <Message>페이지를 찾을 수 없습니다 😢</Message>
      <StyledLink to="/">홈으로 돌아가기</StyledLink>
    </Container>
  );
};

export default NotFoundPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  color: #162733;
`;

const Title = styled.h1`
  font-size: 96px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const Message = styled.p`
  font-size: 20px;
  margin-bottom: 32px;
`;

const StyledLink = styled(Link)`
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
