import React from "react";
import { HotTopicContainer, TopicItem } from "./HotTopic.styles";
import { useRecoilValue } from "recoil";
import {
  examplesState,
  slideIndexSate,
} from "../../../../widgets/Home/model/examplesState";

export const HotTopicList: React.FC = () => {
  const examples = useRecoilValue(examplesState); // recoil 상태에서 데이터 가져오기
  const slideIndex = useRecoilValue(slideIndexSate);

  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>
      <ul>
        {examples.map((topic, i) => (
          <TopicItem key={topic.id} $active={i === slideIndex}>
            {topic.title}
          </TopicItem>
        ))}
      </ul>
      <p>갱신시간 기준</p>
    </HotTopicContainer>
  );
};
