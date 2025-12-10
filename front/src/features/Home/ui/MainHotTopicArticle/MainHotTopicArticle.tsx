import { useEffect, useState } from "react";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { useRecoilState } from "recoil";

import {
  ArticleContainer,
  Image,
  Title,
  Summary,
  CompareBox,
  ArrowButton,
  SlideWrapper,
  DotContainer,
  Dot,
  ImageWrapper,
} from "@/features/home/ui/MainHotTopicArticle/MainHotTopicArticle.styles";

import { hotTopicSlideIndexSate } from "@/features/home/model/examplesState";
import { useHotTopicQuery } from "@/features/home/hooks/useHotTopicQuery";

export const MainHotTopicArticle = () => {
  const [slideIndex, setSlideIndex] = useRecoilState(hotTopicSlideIndexSate);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const fallbackImg = "https://placehold.co/800x400";

  const { data: hotTopicData, isFetching } = useHotTopicQuery();

  const handlePrev = () => {
    if (!hotTopicData) return;
    setSlideIndex((prev) => (prev === 0 ? hotTopicData.length - 1 : prev - 1));
    setRestTimer((prev) => prev + 1);
  };

  const handleNext = () => {
    if (!hotTopicData) return;
    setSlideIndex((prev) => (prev === hotTopicData.length - 1 ? 0 : prev + 1));
    setRestTimer((prev) => prev + 1);
  };

  const moveDot = (index: number) => setSlideIndex(index);

  // 자동 슬라이드
  useEffect(() => {
    if (isPaused || !hotTopicData) return;
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [restTimer, isPaused, hotTopicData]);

  if (isFetching) return <p>Loading...</p>;
  if (!hotTopicData || hotTopicData.length === 0)
    return <p>데이터가 없습니다.</p>;

  const article = hotTopicData[slideIndex];

  return (
    <SlideWrapper
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ArticleContainer>
        <ImageWrapper>
          <ArrowButton direction="left" onClick={handlePrev}>
            <MdOutlineArrowBackIos size={28} />
          </ArrowButton>

          <Image
            src={article?.image_original_url || fallbackImg}
            alt="메인 기사"
          />

          <ArrowButton direction="right" onClick={handleNext}>
            <MdOutlineArrowForwardIos size={28} />
          </ArrowButton>
        </ImageWrapper>

        <Title>
          <h2>{article.title}</h2>
        </Title>
        <Summary>{article.summary_text}</Summary>

        <CompareBox>
          <h4>AI 요약 vs 원문 비교</h4>
          <p>AI 요약: {article.summary_text}</p>
          <p>원문: {article.full_text}</p>
        </CompareBox>
      </ArticleContainer>

      <DotContainer>
        {hotTopicData.map((_, index) => (
          <Dot
            key={index}
            $active={slideIndex === index}
            onClick={() => moveDot(index)}
          />
        ))}
      </DotContainer>
    </SlideWrapper>
  );
};
