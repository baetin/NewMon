import { IoArrowUpOutline } from 'react-icons/io5';

import { Container } from './ScrollToTop.styles';

interface ScrollToTopProps {
  targetRef?: React.RefObject<HTMLDivElement | null>;
}

export const ScrollToTopComponent = ({ targetRef }: ScrollToTopProps) => {
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
