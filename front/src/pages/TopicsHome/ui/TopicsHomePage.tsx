import type React from "react";
import TopicsMainArticle from "../../../widgets/TopicsHome/ui/TopicsMainArticle/TopicsMainArticle";
import TopicsSubArticleList from "../../../widgets/TopicsHome/ui/TopicsSubArticleList/TopicsSubArticleList";
import {
  Container,
  Left,
  Right,
} from "../../../shared/styles/articleContents.styles";

const TopicsHomePage: React.FC = () => {
  return (
    <Container>
      <Left>
        <TopicsMainArticle />
      </Left>
      <Right>
        <TopicsSubArticleList />
      </Right>
    </Container>
  );
};

export default TopicsHomePage;
