import React, { useEffect, useState } from "react";
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
} from "./MainArticle.styles";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { useRecoilState, useRecoilValue } from "recoil";
import { examplesState, slideIndexSate } from "../../model/examplesState";

export const MainArticle: React.FC = () => {
  const [slideIndex, setSlideIndex] = useRecoilState(slideIndexSate); // 현재 슬라이드 인덱스

  const [restTimer, setRestTimer] = useState(0); // 타이머 리셋용
  const [isPaused, setIsPaused] = useState(false); // 슬라이드 일시정지
  const examples = useRecoilValue(examplesState); // recoil 상태에서 데이터 가져오기

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
    setRestTimer((prev) => prev + 1);
  };
  const handleNext = () => {
    setSlideIndex((prev) => (prev === examples.length - 1 ? 0 : prev + 1));
    setRestTimer((prev) => prev + 1);
  };
  const moveDot = (index: number) => {
    setSlideIndex(index);
  };

  // 무한 슬라이드
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
      console.log(isPaused);
    }, 4000);
    return () => clearInterval(interval);
  }, [restTimer, isPaused]);

  const article = examples[slideIndex];

  return (
    <SlideWrapper
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ArrowButton direction="left" onClick={handlePrev}>
        <MdOutlineArrowBackIos size={28} />
      </ArrowButton>

      <ArticleContainer>
        <Image src={article.image_url} alt="메인 기사" />
        <Title>{article.title}</Title>
        <Summary>{article.summary}</Summary>
        <CompareBox>
          <h4>AI 요약 vs 원문 비교</h4>
          <p>AI 요약: {article.compare.ai_summary}</p>
          <p>원문: {article.compare.original}</p>
        </CompareBox>
      </ArticleContainer>

      <DotContainer>
        {examples.map((_, index) => (
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
