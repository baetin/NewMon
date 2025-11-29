import { HotTopicContainer, TopicItem } from "../Topic.styles";
import { useRecoilState } from "recoil";
import { hotTopicSlideIndexSate } from "../../../../widgets/Home/model/examplesState";
import { useHotTopicQuery } from "../../../../widgets/Home/hooks/useHotTopicQuery";

export const HotTopicList = () => {
  const { data: hotTopicData, isLoading } = useHotTopicQuery();
  const [slideIndex, setSlideIndex] = useRecoilState(hotTopicSlideIndexSate);

  const handleTopicClick = (index: number) => setSlideIndex(index);

  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>

      {isLoading && <p>Loading...</p>}
      {!isLoading && hotTopicData && hotTopicData.length === 0 && (
        <div>데이터가 없습니다.</div>
      )}
      {!isLoading && hotTopicData && hotTopicData.length > 0 && (
        <ul>
          {hotTopicData.map((topic, i) => (
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
