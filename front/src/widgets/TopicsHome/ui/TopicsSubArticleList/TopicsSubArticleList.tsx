import { useState } from "react";
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

interface ArticleDataProps {
  articles: ArticleDataTypes[];
}

const TopicsSubArticleList = ({ articles }: ArticleDataProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);

  const handleSeeMore = () => setVisibleCount((prev) => prev + 4);

  if (!articles.length) return <div>추가 기사가 없습니다.</div>;

  const visibleArticles = articles.slice(0, visibleCount);

  const selectedArticle = articles.find((a) => a.article_id === selectedId);

  return (
    <>
      <ListContainer>
        {visibleArticles.map((article) => (
          <SubArticle
            key={article.article_id}
            layoutId={`card-${article.article_id}`}
            onClick={() => setSelectedId(article.article_id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "keyframes", stiffness: 200, damping: 20 }}
          >
            <Texts>
              <Title>{article.title}</Title>
              <Summary>{article.summary_text}</Summary>
            </Texts>
            <Image src={article.image_url} alt={article.title} />
          </SubArticle>
        ))}

        {visibleCount < articles.length && <SeeMore onClick={handleSeeMore} />}
      </ListContainer>

      <AnimatePresence>
        {selectedArticle && (
          <ExpandedArticle
            article={selectedArticle}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TopicsSubArticleList;
