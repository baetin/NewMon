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
import { examples } from "../../model/examples";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";

export const MainArticle: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setSlideIndex((prev) => (prev === examples.length - 1 ? 0 : prev + 1));
  };
  const moveDot = (index: number) => {
    setSlideIndex(index);
  };

  // 무한 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const article = examples[slideIndex];

  return (
    <SlideWrapper>
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
