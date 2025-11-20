import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArticleContainer,
  Title,
  Summary,
  Image,
  Contents,
} from "./TopicsMainArticle.styles";
import ExpandedArticle from "../../../../features/article-expand/ui/ExpandedArticle";
import type { ArticleDataTypes } from "../../../../shared/types/Article.types";
import { Spinner } from "../../../../shared/ui";

interface ArticleDataProps {
  article: ArticleDataTypes;
}

const TopicsMainArticle = ({ article }: ArticleDataProps) => {
  const [selected, setSelected] = useState(false);

  if (!article) return <Spinner />;

  return (
    <>
      <motion.div
        layoutId={`card-${article.article_id}`}
        onClick={() => setSelected(true)}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: "pointer", width: "100%" }}
      >
        <ArticleContainer>
          {article.image_url && (
            <Image src={article.image_url} alt={article.title} />
          )}
          <Contents>
            <Title>{article.title}</Title>
            {article.summary_text && (
              <Summary>AI 요약 : {article.summary_text}</Summary>
            )}
          </Contents>
        </ArticleContainer>
      </motion.div>

      <AnimatePresence mode="wait">
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
