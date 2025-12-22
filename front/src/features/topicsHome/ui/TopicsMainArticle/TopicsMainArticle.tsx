import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { ExpandedArticle } from '@/features/article-expand';
import type { ArticleDataTypes } from '@/shared/types/Article.types';

import {
  ArticleContainer,
  Contents,
  Image,
  Summary,
  Title,
} from './TopicsMainArticle.styles';

interface ArticleDataProps {
  article: ArticleDataTypes;
}

export const TopicsMainArticle = ({ article }: ArticleDataProps) => {
  const [selected, setSelected] = useState(false);

  return (
    <>
      <motion.div
        layoutId={`card-${article.article_id}`}
        onClick={() => setSelected(true)}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: 'pointer', width: '100%' }}
      >
        <ArticleContainer>
          {article.image_original_url && (
            <Image src={article.image_original_url} alt={article.title} />
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
