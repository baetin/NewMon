import { useInterestsQuery } from '@/features/home/hooks/useInterestsQuery';
import { HotTopicContainer, TopicItem } from '@/features/home/ui/Topic.styles';

import { useTopicSelection } from '../../hooks/useTopicSelection';

export const InterestTopic = () => {
  const { data: interestsTopicData, isPending } = useInterestsQuery();
  const { selectedIndex, selectTopic } = useTopicSelection('interest');
  return (
    <HotTopicContainer>
      <h3>🔥 Your Interest Topic</h3>

      {isPending && <p>Loading...</p>}

      {!isPending && interestsTopicData?.length === 0 && (
        <div>데이터가 없습니다.</div>
      )}

      {!isPending && interestsTopicData && interestsTopicData.length > 0 && (
        <ul>
          {interestsTopicData.map((topic, i) => (
            <TopicItem
              key={topic.article_id}
              $active={i === selectedIndex}
              onClick={() => selectTopic(i)}
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
