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
  const [slideIndex, setSlideIndex] = useRecoilState(interestsSlideIndexSate); // 현재 슬라이드 인덱스
  const [restTimer, setRestTimer] = useState(0); // 타이머 리셋용
  const [isPaused, setIsPaused] = useState(false); // 슬라이드 일시정지
  const fallbackImg = "https://placehold.co/800x400";

  const { data: InterestsTopicData, isPending } = useInterestsQuerty();

  //  데이터 없을 때 예외 처리
  if (!InterestsTopicData || InterestsTopicData.length === 0 || isPending) {
    return <p>Loading...</p>;
  }
  // const newExamples = useRecoilValue(newExamplesState); // recoil 상태에서 데이터 가져오기 (로그인 후 사용자 맞춤)

  const handlePrev = () => {
    setSlideIndex((prev) =>
      prev === 0 ? InterestsTopicData.length - 1 : prev - 1
    );
    setRestTimer((prev) => prev + 1);
  };
  const handleNext = () => {
    setSlideIndex((prev) =>
      prev === InterestsTopicData.length - 1 ? 0 : prev + 1
    );
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
    }, 4000);
    return () => clearInterval(interval);
  }, [restTimer, isPaused]);

  const article = InterestsTopicData[slideIndex];

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
          {/* <p>원문: {article.compare.original}</p> */}
        </CompareBox>
      </ArticleContainer>

      <DotContainer>
        {InterestsTopicData.map((_, index) => (
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
