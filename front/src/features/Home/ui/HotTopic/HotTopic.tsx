import { HotTopicContainer, TopicItem } from "./HotTopic.styles";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  examplesState,
  slideIndexSate,
} from "../../../../widgets/Home/model/examplesState";

export const HotTopicList = () => {
  const examples = useRecoilValue(examplesState); // recoil 상태에서 데이터 가져오기
  const [slideIndex, setSlideIndex] = useRecoilState(slideIndexSate); // 현재 슬라이드 인덱스

  const handleTopicClick = (index: number) => {
    setSlideIndex(index);
  };

  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>
      <ul>
        {examples.map((topic, i) => (
          <TopicItem
            key={topic.id}
            $active={i === slideIndex}
            onClick={() => handleTopicClick(i)}
          >
            {topic.title}
          </TopicItem>
        ))}
      </ul>
      <p>갱신시간 기준</p>
    </HotTopicContainer>
  );
};
