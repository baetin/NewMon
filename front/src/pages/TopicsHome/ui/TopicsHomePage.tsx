import type React from "react";
import TopicsMainArticle from "../../../widgets/TopicsHome/ui/TopicsMainArticle/TopicsMainArticle";
import TopicsSubArticleList from "../../../widgets/TopicsHome/ui/TopicsSubArticleList/TopicsSubArticleList";
import {
  Container,
  TopicsLeft,
  Right,
} from "../../../shared/styles/articleContents.styles";

const TopicsHomePage: React.FC = () => {
  return (
    <Container>
      <TopicsLeft>
        <TopicsMainArticle />
      </TopicsLeft>
      <Right>
        <TopicsSubArticleList />
      </Right>
    </Container>
  );
};

export default TopicsHomePage;
