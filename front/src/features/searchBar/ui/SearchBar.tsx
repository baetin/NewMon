import { useEffect, useState } from 'react';

import { MdSearch } from 'react-icons/md';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { SearchContainer } from './SearchBar.styles';

export const SearchBar = () => {
  const [keyword, setKeyword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const { topic } = useParams<{ topic: string }>();

  const params = new URLSearchParams(location.search);
  const searchParam = params.get('search') ?? '';

  useEffect(() => {
    setKeyword(searchParam);
  }, [searchParam]);

  const onSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    if (searchParam === trimmed) return;

    navigate(`/news/${topic}?search=${trimmed}&page=1`);
  };

  return (
    <SearchContainer>
      <input
        type="text"
        placeholder="검색어를 입력해주세요."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />
      <MdSearch size={22} style={{ cursor: 'pointer' }} onClick={onSearch} />
    </SearchContainer>
  );
};
