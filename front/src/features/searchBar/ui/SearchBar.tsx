import { MdSearch } from "react-icons/md";
import { SearchContainer } from "./SearchBar.styles";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const SearchBar = () => {
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { topic } = useParams<{ topic: string }>();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");

    if (q) {
      setKeyword(q);
    }
  }, [location.search]);

  const onSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/news/${topic}?search=${keyword}&page=1`);
  };

  return (
    <SearchContainer>
      <input
        type="text"
        placeholder="검색어를 입력해주세요."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <MdSearch size={22} style={{ cursor: "pointer" }} onClick={onSearch} />
    </SearchContainer>
  );
};
