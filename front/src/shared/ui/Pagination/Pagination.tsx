import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Container, NavButton, PageText } from "./Pagination.styles";

interface PaginationProps {
  page: number;
  totalPages?: number;
  onPageChange: (next: number) => void;
}

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const isFirst = page === 1;
  const isLast = totalPages !== undefined && page === totalPages;

  return (
    <Container>
      <NavButton disabled={isFirst} onClick={() => onPageChange(page - 1)}>
        <MdKeyboardArrowLeft size={20} />
      </NavButton>

      <PageText>
        {page}/{totalPages}
      </PageText>

      <NavButton disabled={isLast} onClick={() => onPageChange(page + 1)}>
        <MdKeyboardArrowRight size={20} />
      </NavButton>
    </Container>
  );
};
