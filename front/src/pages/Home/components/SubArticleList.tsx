import React from "react";
import { List, SubArticle, Image, Title, Texts } from "./SubArticleList.styles";
import { Summary } from "./MainArticle.styles";

const articles = [
  {
    id: 1,
    title: "작은 기사 1",
    summary: "summary",
    image: "https://placehold.co/150",
  },
  {
    id: 2,
    title: "작은 기사 2",
    summary: "summary",
    image: "https://placehold.co/150",
  },
  {
    id: 3,
    title: "작은 기사 3",
    summary: "summary",
    image: "https://placehold.co/150",
  },
];

const SubArticleList: React.FC = () => {
  return (
    <List>
      {articles.map((article) => (
        <SubArticle key={article.id}>
          <Texts>
            <Title>{article.title}</Title>
            <Summary>{article.summary}</Summary>
          </Texts>
          <Image src={article.image} alt={article.title} />
        </SubArticle>
      ))}
    </List>
  );
};

export default SubArticleList;
