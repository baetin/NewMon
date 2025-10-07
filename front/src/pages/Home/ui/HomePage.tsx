import type React from "react";
import { Container, Left, Right } from "./HomePage.styles";
import MainArticle from "../components/MainArticle";
import SubArticleList from "../components/SubArticleList";

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
