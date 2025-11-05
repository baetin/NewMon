import React, { useState } from "react";
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
import { exArticles } from "../../model/articles";
import { SeeMore } from "../../../../shared/ui/SeeMore/SeeMore";

const TopicsSubArticleList: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 4);
  };
  const visibleArticles = exArticles
    .filter((a) => a.id !== 0)
    .slice(0, visibleCount);

  return (
    <>
      <ListContainer>
        {visibleArticles.map((article) => (
          <SubArticle
            key={article.id}
            layoutId={`card-${article.id}`}
            onClick={() => setSelectedId(article.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "keyframes", stiffness: 200, damping: 20 }}
          >
            <Texts>
              <Title>{article.title}</Title>
              <Summary>{article.summary}</Summary>
            </Texts>
            <Image src={article.image} alt={article.title} />
          </SubArticle>
        ))}
        {/* 더 보기 버튼 */}
        {visibleCount < exArticles.length - 1 && (
          <SeeMore onClick={handleSeeMore} />
        )}
      </ListContainer>

      {/* 클릭시 팝업 */}
      <AnimatePresence>
        {selectedId && (
          <ExpandedArticle
            article={exArticles.find((a) => a.id === selectedId)!}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TopicsSubArticleList;
