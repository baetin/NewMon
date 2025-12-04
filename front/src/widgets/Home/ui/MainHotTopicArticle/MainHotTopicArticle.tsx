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
  ImageWrapper,
} from "./MainHotTopicArticle.styles";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { useRecoilState } from "recoil";
import { hotTopicSlideIndexSate } from "../../model/examplesState";
import { useHotTopicQuery } from "../../hooks/useHotTopicQuery";

// const mockHotTopicData = [
//   {
//     id: 1,
//     title: "한국은행, 기준금리 동결 발표",
//     summary_text:
//       "한국은행은 물가 안정 및 경기 상황을 고려해 기준금리를 동결하기로 결정했다.한국은행은 물가 안정 및 경기 상황을 고려해 기준금리를 동결하기로 결정했다.한국은행은 물가 안정 및 경기 상황을 고려해 기준금리를 동결하기로 결정했다.한국은행은 물가 안정 및 경기 상황을 고려해 기준금리를 동결하기로 결정했다.한국은행은 물가 안정 및 경기 상황을 고려해 기준금리를 동결하기로 결정했다.한국은행은 물가 안정 및 경기 상황을 고려해 기준금리를 동결하기로 결정했다.",
//     full_text:
//       "한국은행은 2025년 경제전망 발표와 함께 기준금리를 3.25%에서 동결한다고 밝혔다. 이는 최근 완화된 물가 상승세와 경기 부진을 고려한 조치로 분석된다.",
//     image_original_url:
//       "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800",
//   },
//   {
//     id: 2,
//     title: "AI 교육 의무화 추진",
//     summary_text:
//       "정부가 초⋅중⋅고 교육 과정에 AI 교육을 단계적으로 도입할 계획을 발표했다.",
//     full_text:
//       "교육부는 2025년부터 초등학교 5학년부터 고등학교 2학년까지 AI 기초 및 활용 교육을 필수 과목으로 신설한다고 발표했다.",
//     image_original_url:
//       "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800",
//   },
//   {
//     id: 3,
//     title: "전기차 충전소 확대 계획",
//     summary_text:
//       "전기차 보급률 증가에 따라 정부는 충전 인프라 확충을 위한 예산을 배정했다.",
//     full_text:
//       "환경부는 올해 전기차 충전 인프라 확충 사업을 통해 약 1만 개의 신규 충전소를 설치할 계획이라고 발표했다.",
//     image_original_url:
//       "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800",
//   },
// ]; //임시 데이터

export const MainHotTopicArticle = () => {
  const [slideIndex, setSlideIndex] = useRecoilState(hotTopicSlideIndexSate);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const fallbackImg = "https://placehold.co/800x400";

  const { data: hotTopicData, isFetching } = useHotTopicQuery();
  // const hotTopicData = mockHotTopicData;
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

        <Title>{article.title}</Title>
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
