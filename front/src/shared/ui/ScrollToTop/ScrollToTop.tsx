import { IoArrowUpOutline } from 'react-icons/io5';
import styled from 'styled-components';

const Container = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;

  background-color: #000;
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

interface ScrollToTopProps {
  targetRef?: React.RefObject<HTMLDivElement | null>;
}

export const ScrollToTop = ({ targetRef }: ScrollToTopProps) => {
  const onClick = () => {
    if (targetRef?.current) {
      targetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  return (
    <Container aria-label="scroll to top" onClick={onClick}>
      <IoArrowUpOutline size={18} />
    </Container>
  );
};
