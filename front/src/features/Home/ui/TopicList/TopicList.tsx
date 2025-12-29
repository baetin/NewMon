import { useSearchParams } from 'react-router-dom';

import {
  useHotTopicQuery,
  useInterestsQuery,
} from '@/features/home/hooks/useTopicQueries';
import { useTopicSelection } from '@/features/home/hooks/useTopicSelection';
import { TopicContainer, TopicItem } from '@/features/home/ui/TopicList.styles';

export const TopicList = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const { data, isPending } =
    tab === 'interest' ? useInterestsQuery() : useHotTopicQuery();

  const { selectedIndex, selectTopic } = useTopicSelection(
    `${tab === 'interest' ? 'interest' : 'hot'}`
  );

  return (
    <TopicContainer>
      <h3>{tab === 'interest' ? '🔥 Your Interest Topic' : '🔥 Hot Topic'}</h3>

      {isPending && <p>Loading...</p>}
      {!isPending && data?.length === 0 && <div>데이터가 없습니다.</div>}

      {!isPending && data && data.length > 0 && (
        <ul>
          {data.map((topic, i) => (
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
    </TopicContainer>
  );
};
