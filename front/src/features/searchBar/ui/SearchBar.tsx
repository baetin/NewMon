import { MdSearch } from "react-icons/md";
import { SearchContainer } from "./SearchBar.styles";
import React, { useState } from "react";

export const SearchBar = () => {
  const [keyword, setKeyWord] = useState("");

  const onSearch = () => {
    console.log("search", keyword);
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <SearchContainer>
      <input
        type="text"
        placeholder="검색"
        value={keyword}
        onChange={(e) => setKeyWord(e.target.value)}
        onKeyDown={onKeyPress}
      />
      <MdSearch size={22} style={{ cursor: "pointer" }} onClick={onSearch} />
    </SearchContainer>
  );
};
