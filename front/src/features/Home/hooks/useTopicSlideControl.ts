import type { SelectTopicType } from '../model/selectTopic.types';
import { useTopicSelection } from './useTopicSelection';

export const useTopicSlideControl = (
  length: number,
  topic: SelectTopicType
) => {
  const { selectedIndex, selectTopic } = useTopicSelection(topic);

  const prev = () => {
    if (length === 0) return;
    selectTopic(selectedIndex === 0 ? length - 1 : selectedIndex - 1);
  };
  const next = () => {
    if (length === 0) return;
    selectTopic(selectedIndex === length - 1 ? 0 : selectedIndex + 1);
  };

  const moveDot = (index: number) => selectTopic(index);

  return { prev, next, moveDot, selectedIndex };
};
