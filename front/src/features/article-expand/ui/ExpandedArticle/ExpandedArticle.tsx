import { useEffect, useRef, useState } from 'react';

import { AiOutlineClose } from 'react-icons/ai';

import { DiffHighlightText } from '@/features/article-expand/ui/ExpandedArticle/DiffHighlightText';
import type { ArticleDataTypes } from '@/shared/types/Article.types';
import { ScrollToTopComponent } from '@/shared/ui';

import {
  CloseBtn,
  ExpandedCard,
  MainArticle,
  Overlay,
  ScrollContainer,
  SubInforContainer,
} from './ExpandedArticle.styles';

interface ExpandedArticleProps {
  article: ArticleDataTypes;
  onClose: () => void;
}

export const ExpandedArticle = ({ article, onClose }: ExpandedArticleProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setShowScrollTop(el.scrollTop >= 250);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDateTime = (isoString: string) => {
    const [date, timeWithMs] = isoString.split('T');
    const time = timeWithMs?.split('.')[0]; // HH:mm:ss 추출
    return `${date} ${time ?? ''}`;
  };
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ExpandedCard
        ref={scrollRef}
        layoutId={`card-${article.article_id}`}
        transition={{ type: 'spring', stiffness: 150, damping: 18 }}
      >
        <CloseBtn>
          <AiOutlineClose size={30} onClick={() => onClose()} />
        </CloseBtn>
        <h2>{article.title}</h2>
        <SubInforContainer>
          <p>출처 : {article.source === 'hankyung' ? '한국경제' : 'X'}</p>
          <p className="written">
            입력 : {formatDateTime(article.published_date)}
          </p>
          <p className="modified">
            수정 : {formatDateTime(article.modified_at)}
          </p>
        </SubInforContainer>
        <img
          src={article.image_original_url}
          alt={article.title}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '12px',
            marginBottom: '1rem',
          }}
        />

        <p>AI 요약 : {article.summary_text}</p>
        {article.article_id && (
          <MainArticle>
            본문 기사 :{' '}
            <DiffHighlightText
              previous={article.previous_full_text}
              full={article.full_text}
            />
          </MainArticle>
        )}
        {showScrollTop && (
          <ScrollContainer $visible={showScrollTop}>
            <ScrollToTopComponent targetRef={scrollRef} />
          </ScrollContainer>
        )}
      </ExpandedCard>
    </Overlay>
  );
};
