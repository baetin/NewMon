import type { ArticleDataTypes } from "../../../shared/types/Article.types";
import {
  ExpandedCard,
  Overlay,
  MainArticle,
  CloseBtn,
} from "./ExpandedArticle.styles";
import { AiOutlineClose } from "react-icons/ai";

interface ExpandedArticleProps {
  article: ArticleDataTypes;
  onClose: () => void;
}

const ExpandedArticle = ({ article, onClose }: ExpandedArticleProps) => {
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ExpandedCard
        layoutId={`card-${article.article_id}`}
        transition={{ type: "spring", stiffness: 150, damping: 18 }}
      >
        <CloseBtn>
          <AiOutlineClose size={30} onClick={() => onClose()} />
        </CloseBtn>
        <h2>{article.title}</h2>
        <span>출처 : {article.source === "hankyung" ? "한국경제" : "X"}</span>
        <img
          src={article.image_url}
          alt={article.title}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "12px",
            marginBottom: "1rem",
          }}
        />

        <p>AI 요약 : {article.summary_text}</p>
        {article.article_id && (
          <MainArticle>본문 기사 : {article.full_text}</MainArticle>
        )}
      </ExpandedCard>
    </Overlay>
  );
};
export default ExpandedArticle;
