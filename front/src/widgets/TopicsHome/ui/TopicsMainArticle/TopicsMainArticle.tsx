import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArticleContainer,
  Title,
  Summary,
  Image,
  Contents,
} from "./TopicsMainArticle.styles";
import ExpandedArticle from "../../../../features/article-expand/ui/ExpandedArticle";
import { getArticles } from "../../api/getArticles";
import type { ArticleDataTypes } from "../../../../shared/types/Article.types";
import { useParams } from "react-router-dom";
import type { TopicType } from "../../../../shared/types/Topics.types";
import { Spinner } from "../../../../shared/ui";

const TopicsMainArticle: React.FC = () => {
  const [selected, setSelected] = useState<boolean>(false);
  const [article, setArticle] = useState<ArticleDataTypes | null>(null);
  const { topic, id } = useParams<{ topic: string; id: "1" }>(); // 임시 id 타입

  useEffect(() => {
    const fetchArticles = async () => {
      if (!topic || !id) return;

      try {
        const data = await getArticles(topic as TopicType);
        if (data.length > 0) {
          setArticle(data[0]); // 첫번째 기사만
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    fetchArticles();
  }, [topic, id]);

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
