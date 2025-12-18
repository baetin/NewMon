import { useEffect, useState } from 'react';

import { MdSearch } from 'react-icons/md';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { SearchContainer } from './SearchBar.styles';

export const SearchBar = () => {
  const [keyword, setKeyword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const { topic } = useParams<{ topic: string }>();

  const onSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const params = new URLSearchParams(location.search);
    const currentSearch = params.get('search');

    if (currentSearch === trimmed) return;
    navigate(`/news/${topic}?search=${trimmed}&page=1`);
  };

  useEffect(() => {
    if (!topic) return;
    setKeyword('');
    navigate(`/news/${topic}?page=1`, { replace: true });
  }, [topic]);

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
