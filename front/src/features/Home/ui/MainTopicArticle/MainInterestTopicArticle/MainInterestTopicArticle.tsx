import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from 'react-icons/md';

import { useAutoSlide } from '@/features/home/hooks/useAutoSlide';
import { useInterestsQuery } from '@/features/home/hooks/useTopicQueries';
import { useTopicSlideControl } from '@/features/home/hooks/useTopicSlideControl';
import {
  ArrowButton,
  ArticleContainer,
  CompareBox,
  Dot,
  DotContainer,
  Image,
  ImageWrapper,
  SlideWrapper,
  Summary,
  Title,
} from '@/features/home/ui/MainTopicArticle/MainTopicArticle.styles';

export const MainInterestsArticle = () => {
  const { data, isPending } = useInterestsQuery();
  const { prev, next, moveDot, selectedIndex } = useTopicSlideControl(
    data?.length ?? 0,
    'interest'
  );
  const { setIsPaused } = useAutoSlide({
    enabled: !!data && data.length > 1, // boolean
    onNext: next,
  });

  const fallbackImg = 'https://placehold.co/800x400';

  // 로딩 / 빈 데이터 처리
  if (isPending) return <p>Loading...</p>;
  if (!data || data.length === 0) return <p>데이터가 없습니다.</p>;

  const article = data[selectedIndex];

  return (
    <SlideWrapper
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ArticleContainer>
        <ImageWrapper>
          <ArrowButton direction="left" onClick={prev}>
            <MdOutlineArrowBackIos size={28} />
          </ArrowButton>

          <Image
            src={article?.image_original_url || fallbackImg}
            alt="메인 기사"
          />

          <ArrowButton direction="right" onClick={next}>
            <MdOutlineArrowForwardIos size={28} />
          </ArrowButton>
        </ImageWrapper>

        <Title>{article.title}</Title>
        <Summary>{article.summary_text}</Summary>

        <CompareBox>
          <h4>AI 요약 vs 원문 비교</h4>
          <p>AI 요약: {article.summary_text}</p>
          <p>원문: {article.full_text}</p>
        </CompareBox>
      </ArticleContainer>

      <DotContainer>
        {data.map((_, index) => (
          <Dot
            key={index}
            $active={selectedIndex === index}
            onClick={() => moveDot(index)}
          />
        ))}
      </DotContainer>
    </SlideWrapper>
  );
};
