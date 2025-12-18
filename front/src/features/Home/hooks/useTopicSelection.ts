import { useRecoilState } from 'recoil';

import {
  hotTopicSlideIndexSate,
  interestsSlideIndexSate,
} from '../model/examplesState';
import type { SelectTopicType } from '../model/selectTopic.types';

const topicIndexStateMap = {
  hot: hotTopicSlideIndexSate,
  interest: interestsSlideIndexSate,
} as const;

export const useTopicSelection = (topic: SelectTopicType) => {
  const [selectedIndex, setSelectedIndex] = useRecoilState(
    topicIndexStateMap[topic]
  );

  const selectTopic = (i: number) => {
    setSelectedIndex(i);
  };

  return { selectedIndex, selectTopic };
};
