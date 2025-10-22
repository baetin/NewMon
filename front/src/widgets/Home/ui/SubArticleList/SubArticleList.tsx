import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  List,
  SubArticle,
  Image,
  Title,
  Texts,
  Summary,
} from "./SubArticleList.styles";
import ExpandedArticle from "../../../../features/article-expand/ui/ExpandedArticle";
import { exArticles } from "../../model/articles";

const SubArticleList: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <List>
        {exArticles.map((article) =>
          article.id === 0 ? null : (
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
          )
        )}
      </List>

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

export default SubArticleList;
