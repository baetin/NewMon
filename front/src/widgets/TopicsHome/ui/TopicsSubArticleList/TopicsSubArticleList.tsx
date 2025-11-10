import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ListContainer,
  SubArticle,
  Image,
  Title,
  Texts,
  Summary,
} from "./TopicsSubArticleList.styles";
import ExpandedArticle from "../../../../features/article-expand/ui/ExpandedArticle";
import { SeeMore } from "../../../../shared/ui/SeeMore/SeeMore";
import type { ArticleDataTypes } from "../../../../shared/types/Article.types";
import { useParams } from "react-router-dom";
import { getArticles } from "../../api/getArticles";
import type { TopicType } from "../../../../shared/types/Topics.types";
import { Spinner } from "../../../../shared/ui";

const TopicsSubArticleList: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [articles, setArticles] = useState<ArticleDataTypes[]>([]);
  const { topic, id } = useParams<{ topic: string; id: string }>();

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      if (!topic || !id) return;

      try {
        const data = await getArticles(topic as TopicType, Number(id));
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    fetchArticles();
  }, [topic, id]);

  const visibleArticles = articles
    .filter((a) => a.keyword_id !== 0)
    .slice(0, visibleCount); // 첫번째 기사는 제외

  if (!articles.length) return <Spinner />;

  return (
    <>
      <ListContainer>
        {visibleArticles.map((article) => (
          <SubArticle
            key={article.keyword_id}
            layoutId={`card-${article.keyword_id}`}
            onClick={() => setSelectedId(article.keyword_id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "keyframes", stiffness: 200, damping: 20 }}
          >
            <Texts>
              <Title>{article.title}</Title>
              <Summary>{article.summary}</Summary>
            </Texts>
            <Image src={article.publisher} alt={article.title} />
          </SubArticle>
        ))}
        {/* 더 보기 버튼 */}
        {visibleCount < articles.length - 1 && (
          <SeeMore onClick={handleSeeMore} />
        )}
      </ListContainer>

      {/* 클릭시 팝업 */}
      <AnimatePresence>
        {selectedId && (
          <ExpandedArticle
            article={articles.find((a) => a.keyword_id === selectedId)!}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TopicsSubArticleList;
