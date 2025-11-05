import React from "react";
import {
  ArticleContainer,
  Image,
  Title,
  Summary,
  CompareBox,
} from "./MainArticle.styles";

export const MainArticle: React.FC = () => {
  return (
    <ArticleContainer>
      <Image src="https://placehold.co/800x400" alt="메인 기사" />
      <Title>한국은행, 기준금리 동결</Title>
      <Summary>🤖 경기 둔화 우려 속 금리 인상 멈춤</Summary>
      <CompareBox>
        <h4>AI 요약 vs 원문 비교</h4>
        <p>AI 요약: 경기 둔화 우려로 금리 인상 멈춤</p>
        <p>원문: 한국은행은 오늘 열린 금융통화위원회에서...</p>
      </CompareBox>
    </ArticleContainer>
  );
};
