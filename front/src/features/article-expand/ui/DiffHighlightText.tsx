import { diffWords } from "diff";
import { DiffWordContainer } from "./DiffHighlightText.styles";

interface DiffHighlightTextProps {
  before: string | undefined;
  full: string;
}

const getDiffParts = ({ before, full }: DiffHighlightTextProps) => {
  if (!before || before === full) return null;
  return diffWords(before, full);
};

export const DiffHighlightText = ({ before, full }: DiffHighlightTextProps) => {
  const diff = getDiffParts({ before, full });
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
