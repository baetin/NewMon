import type React from "react";
import { Container, Left, Right } from "./HomePage.styles";
import MainArticle from "../../../widgets/Home/ui/MainArticle/MainArticle";
import SubArticleList from "../../../widgets/Home/ui/SubArticleList/SubArticleList";

const HomePage: React.FC = () => {
  return (
    <Container>
      <Left>
        <MainArticle />
      </Left>
      <Right>
        <SubArticleList />
      </Right>
    </Container>
  );
};

export default HomePage;
