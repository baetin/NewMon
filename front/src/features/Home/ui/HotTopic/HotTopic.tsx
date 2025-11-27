import { HotTopicContainer, TopicItem } from "../Topic.styles";
import { useRecoilState } from "recoil";
import { hotTopicSlideIndexSate } from "../../../../widgets/Home/model/examplesState";
import { useHotTopicQuery } from "../../../../widgets/Home/hooks/useHotTopicQuery";

export const HotTopicList = () => {
  const { data: hotTopicData, isPending } = useHotTopicQuery();
  const [slideIndex, setSlideIndex] = useRecoilState(hotTopicSlideIndexSate); // 현재 슬라이드 인덱스

  if (isPending || !hotTopicData || hotTopicData.length === 0) {
    return <p>Loading...</p>;
  }

  const handleTopicClick = (index: number) => {
    setSlideIndex(index);
  };

  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>
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
      <p>갱신시간 기준</p>
    </HotTopicContainer>
  );
};
