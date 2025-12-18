import { useHotTopicQuery } from '@/features/home/hooks/useHotTopicQuery';
import { HotTopicContainer, TopicItem } from '@/features/home/ui/Topic.styles';

import { useTopicSelection } from '../../hooks/useTopicSelection';

export const HotTopicList = () => {
  const { data: hotTopicData, isPending } = useHotTopicQuery();
  const { selectedIndex, selectTopic } = useTopicSelection('hot');

  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>

      {isPending && <p>Loading...</p>}
      {!isPending && hotTopicData?.length === 0 && (
        <div>데이터가 없습니다.</div>
      )}

      {!isPending && hotTopicData && hotTopicData.length > 0 && (
        <ul>
          {hotTopicData.map((topic, i) => (
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
