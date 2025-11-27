import { useEffect, useState } from "react";
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
} from "../MainHotTopicArticle/MainHotTopicArticle.styles";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { useRecoilState } from "recoil";
import { interestsSlideIndexSate } from "../../model/examplesState";
import { useInterestsQuerty } from "../../hooks/useInterestsQuerty";
export const MainInterestsArticle = () => {
  const [slideIndex, setSlideIndex] = useRecoilState(interestsSlideIndexSate);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const fallbackImg = "https://placehold.co/800x400";

  const { data: interestsTopicData, isLoading } = useInterestsQuerty();

  const handlePrev = () => {
    if (!interestsTopicData) return;
    setSlideIndex((prev) =>
      prev === 0 ? interestsTopicData.length - 1 : prev - 1
    );
    setRestTimer((prev) => prev + 1);
  };

  const handleNext = () => {
    if (!interestsTopicData) return;
    setSlideIndex((prev) =>
      prev === interestsTopicData.length - 1 ? 0 : prev + 1
    );
    setRestTimer((prev) => prev + 1);
  };

  const moveDot = (index: number) => setSlideIndex(index);

  // 자동 슬라이드
  useEffect(() => {
    if (isPaused || !interestsTopicData) return;
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [restTimer, isPaused, interestsTopicData]);

  // 로딩 / 빈 데이터 처리
  if (isLoading) return <p>Loading...</p>;
  if (!interestsTopicData || interestsTopicData.length === 0)
    return <p>데이터가 없습니다.</p>;

  const article = interestsTopicData[slideIndex];

  return (
    <SlideWrapper
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ArrowButton direction="left" onClick={handlePrev}>
        <MdOutlineArrowBackIos size={28} />
      </ArrowButton>

      <ArticleContainer>
        <Image src={article?.image_url || fallbackImg} alt="메인 기사" />
        <Title>{article.title}</Title>
        <Summary>{article.summary_text}</Summary>
        <CompareBox>
          <h4>AI 요약 vs 원문 비교</h4>
          <p>AI 요약: {article.summary_text}</p>
          {/* <p>원문: {article.original}</p> */}
        </CompareBox>
      </ArticleContainer>

      <DotContainer>
        {interestsTopicData.map((_, index) => (
          <Dot
            key={index}
            $active={slideIndex === index}
            onClick={() => moveDot(index)}
          />
        ))}
      </DotContainer>

      <ArrowButton direction="right" onClick={handleNext}>
        <MdOutlineArrowForwardIos size={28} />
      </ArrowButton>
    </SlideWrapper>
  );
};
