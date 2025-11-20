import TopicsMainArticle from "../../../widgets/TopicsHome/ui/TopicsMainArticle/TopicsMainArticle";
import TopicsSubArticleList from "../../../widgets/TopicsHome/ui/TopicsSubArticleList/TopicsSubArticleList";
import {
  Container,
  TopicsLeft,
  Right,
} from "../../../shared/styles/articleContents.styles";
import { useEffect, useState } from "react";
import type { ArticleDataTypes } from "../../../shared/types/Article.types";
import { getArticles } from "../api/getArticles";
import { topicMap } from "../model/topics.constants";
import { useParams } from "react-router-dom";
import { Spinner } from "../../../shared/ui";

const TopicsHomePage = () => {
  const [articles, setArticles] = useState<ArticleDataTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { topic } = useParams<{ topic: string }>();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (!topic) return;
        const topicId = topicMap[topic.toLowerCase()];
        const data = await getArticles(topicId);
        setArticles(data[0].articles);
        console.log("불러온 데이터 : ", data);
      } catch (error) {
        console.error("기사 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [topic]);

  if (loading) return <Spinner />;
  if (!articles.length) return <div>게시글이 없습니다.</div>;

  const mainArticle = articles[0];
  const subArticles = articles.slice(1);

  return (
    <Container>
      <TopicsLeft>
        <TopicsMainArticle article={mainArticle} />
      </TopicsLeft>
      <Right>
        <TopicsSubArticleList articles={subArticles} />
      </Right>
    </Container>
  );
};

export default TopicsHomePage;
