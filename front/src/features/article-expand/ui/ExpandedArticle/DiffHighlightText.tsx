import { diffWords } from 'diff';

import { DiffWordContainer } from './DiffHighlightText.styles';

interface DiffHighlightTextProps {
  previous: string | undefined;
  full: string;
}

const getDiffParts = ({ previous, full }: DiffHighlightTextProps) => {
  if (!previous || previous === full) return null;
  return diffWords(previous, full);
};

export const DiffHighlightText = ({
  previous,
  full,
}: DiffHighlightTextProps) => {
  const diff = getDiffParts({ previous, full });
  if (!diff) return full;

  return (
    <span>
      {diff.map((part, index) => {
        return (
          <DiffWordContainer
            key={index}
            $added={part.added}
            $removed={part.removed}
          >
            {part.value}
          </DiffWordContainer>
        );
      })}
    </span>
  );
};
