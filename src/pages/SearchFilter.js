// SearchFilter.js
import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Call the parent function to filter files
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFileType(value);
    onFilter(value); // Call the parent function to filter by file type
  };

  return (
    <div className="search-filter">
      <input
        type="text"
        placeholder="Search files..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <select value={fileType} onChange={handleFilterChange}>
        <option value="">All Types</option>
        <option value="image">Images</option>
        <option value="pdf">PDFs</option>
        <option value="doc">Documents</option>
      </select>
    </div>
  );
};

export default SearchFilter;
