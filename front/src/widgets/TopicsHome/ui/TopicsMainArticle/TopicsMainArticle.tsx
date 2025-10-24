import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArticleContainer,
  Title,
  Summary,
  Image,
  Contents,
} from "./TopicsMainArticle.styles";
import ExpandedArticle from "../../../../features/article-expand/ui/ExpandedArticle";
import { exArticles } from "../../model/articles";

const TopicsMainArticle: React.FC = () => {
  const [selected, setSelected] = useState<boolean>(false);
  const article = exArticles[0]; // 예시로 첫 번째 기사 사용

  return (
    <>
      <motion.div
        layoutId={`main-article-${article.id}`}
        onClick={() => setSelected(true)}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: "pointer" }}
      >
        <ArticleContainer>
          <Image src={article.image} alt={article.title} />
          <Contents>
            <Title>{article.title}</Title>
            <Summary>AI 요약 : {article.summary}</Summary>
          </Contents>
        </ArticleContainer>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <ExpandedArticle
            article={article}
            onClose={() => setSelected(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TopicsMainArticle;
