import React from "react";
import "./SearchBar.css";

const SearchBar = ({ setSearchQuery }) => {
  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search by subject or topic..."
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
};

export default SearchBar;
