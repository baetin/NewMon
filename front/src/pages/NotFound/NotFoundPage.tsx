import { Container, Message, StyledLink, Title } from './NotFoundPage.styles';

const NotFoundPage = () => {
  return (
    <Container>
      <Title>404</Title>
      <Message>페이지를 찾을 수 없습니다 😢</Message>
      <StyledLink to="/">홈으로 돌아가기</StyledLink>
    </Container>
  );
};

export default NotFoundPage;
