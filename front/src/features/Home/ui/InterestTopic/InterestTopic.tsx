import { useRecoilState } from "recoil";

import { interestsSlideIndexSate } from "@/features/home/model/examplesState";
import { useInterestsQuery } from "@/features/home/hooks/useInterestsQuery";

import { HotTopicContainer, TopicItem } from "@/features/home/ui/Topic.styles";

export const InterestTopic = () => {
  const { data: interestsTopicData, isLoading } = useInterestsQuery();
  const [slideIndex, setSlideIndex] = useRecoilState(interestsSlideIndexSate);

  const handleTopicClick = (index: number) => setSlideIndex(index);

  return (
    <HotTopicContainer>
      <h3>🔥 Your Interest Topic</h3>

      {isLoading && <p>Loading...</p>}

      {!isLoading && interestsTopicData?.length === 0 && (
        <div>데이터가 없습니다.</div>
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
