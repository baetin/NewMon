import { ArticleContainer, Title, Summary, Image } from "./MainArticle.styles";

const MainArticle: React.FC = () => {
  return (
    <ArticleContainer>
      <Image src="https://placehold.co/600x400" alt="메인 기사" />
      <Title>메인 기사 제목</Title>
      <Summary>기사 요약 내용이 여기에 들어갑니다.</Summary>
    </ArticleContainer>
  );
};

export default MainArticle;
