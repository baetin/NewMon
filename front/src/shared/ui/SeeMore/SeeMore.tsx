import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { CircleButton, Container } from "./SeeMore.styles";
import { useEffect, useState } from "react";

interface SeeMoreProps {
  onClick: () => void;
}

export const SeeMore = ({ onClick }: SeeMoreProps) => {
  const [moveUpDown, setMoveUpDown] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoveUpDown((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <CircleButton onClick={onClick} $move={moveUpDown}>
        <MdOutlineKeyboardDoubleArrowDown size={28} />
      </CircleButton>
    </Container>
  );
};
