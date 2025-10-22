import type { ArticleType } from "../../../shared/types/Article.types";
import {
  ExpandedCard,
  Overlay,
  MainArticle,
  CloseBtn,
} from "./ExpandedArticle.styles";
import { AiOutlineClose } from "react-icons/ai";

interface ExpandedArticleProps {
  article: ArticleType;
  onClose: () => void;
}

const ExpandedArticle: React.FC<ExpandedArticleProps> = ({
  article,
  onClose,
}) => {
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ExpandedCard
        layoutId={`card-${article.id}`}
        transition={{ type: "spring", stiffness: 150, damping: 18 }}
      >
        <CloseBtn>
          <AiOutlineClose size={30} onClick={() => onClose()} />
        </CloseBtn>
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "12px",
            marginBottom: "1rem",
          }}
        />
        <h2>{article.title}</h2>
        <p>AI 요약 : {article.summary}</p>
        {article.article && (
          <MainArticle>본문 기사 : {article.article}</MainArticle>
        )}
      </ExpandedCard>
    </Overlay>
  );
};
export default ExpandedArticle;
