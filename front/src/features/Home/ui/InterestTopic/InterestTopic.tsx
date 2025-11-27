import { useRecoilState } from "recoil";
import { interestsSlideIndexSate } from "../../../../widgets/Home/model/examplesState";
import { HotTopicContainer, TopicItem } from "../Topic.styles";
import { useInterestsQuery } from "../../../../widgets/Home/hooks/useInterestsQuery";

export const InterestTopic = () => {
  const { data: interestsTopicData, isLoading } = useInterestsQuery();
  const [slideIndex, setSlideIndex] = useRecoilState(interestsSlideIndexSate);

  const handleTopicClick = (index: number) => setSlideIndex(index);

  return (
    <HotTopicContainer>
      <h3>🔥 Your Interest Topic</h3>

      {isLoading && <p>Loading...</p>}
      {!isLoading && interestsTopicData && interestsTopicData.length === 0 && (
        <p>데이터가 없습니다.</p>
      )}
      {!isLoading && interestsTopicData && interestsTopicData.length > 0 && (
        <ul>
          {interestsTopicData.map((topic, i) => (
            <TopicItem
              key={topic.article_id}
              $active={i === slideIndex}
              onClick={() => handleTopicClick(i)}
            >
              {topic.title}
            </TopicItem>
          ))}
        </ul>
      )}

      <p>갱신시간 기준</p>
    </HotTopicContainer>
  );
};
