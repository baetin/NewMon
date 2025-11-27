import { useRecoilState } from "recoil";
import { interestsSlideIndexSate } from "../../../../widgets/Home/model/examplesState";
import { HotTopicContainer, TopicItem } from "../Topic.styles";
import { useInterestsQuerty } from "../../../../widgets/Home/hooks/useInterestsQuerty";

export const InterestTopic = () => {
  const { data: InterestsTopicData, isPending } = useInterestsQuerty();
  const [slideIndex, setSlideIndex] = useRecoilState(interestsSlideIndexSate); // 현재 슬라이드 인덱스

  if (isPending || !InterestsTopicData || InterestsTopicData.length === 0) {
    return <p>Loading...</p>;
  }

  const handleTopicClick = (index: number) => {
    setSlideIndex(index);
  };

  return (
    <HotTopicContainer>
      <h3>🔥 Your Interest Topic</h3>
      <ul>
        {InterestsTopicData.map((topic, i) => (
          <TopicItem
            key={topic.article_id}
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
