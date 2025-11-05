import React from "react";
import { HotTopicContainer } from "./HotTopic.styles";

const topics = [
  "📈 원/달러 환율 급등세 지속",
  "🧠 삼성, 차세대 AI칩 공개",
  "⚖️ 국회, 경제 활성화 법안 통과",
];

export const HotTopicList: React.FC = () => {
  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>
      <ul>
        {topics.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
      <p>갱신시간 기준</p>
    </HotTopicContainer>
  );
};
