import TopicsMainArticle from "../../../widgets/TopicsHome/ui/TopicsMainArticle/TopicsMainArticle";
import TopicsSubArticleList from "../../../widgets/TopicsHome/ui/TopicsSubArticleList/TopicsSubArticleList";
import {
  Container,
  TopicsLeft,
  Right,
} from "../../../shared/styles/articleContents.styles";
import { topicMap } from "../model/topics.constants";
import { useParams } from "react-router-dom";
import { Spinner } from "../../../shared/ui";
import { useArticlesQuery } from "../hooks/useArticlesQuery";

const TopicsHomePage = () => {
  const { topic } = useParams<{ topic: string }>();
  const topicId = topic ? topicMap[topic.toLowerCase()] : null;

  if (!topicId) return <div>올바른 주제를 선택해주세요.</div>;

  const { data, isPending, isError } = useArticlesQuery(topicId!);

  if (isPending) return <Spinner />;
  if (isError) return <div>오류가 발생했습니다. 다시 시도해주세요.</div>;
  if (!data || !data.articles?.length) return <div>게시글이 없습니다.</div>;

  const { articles } = data;
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
