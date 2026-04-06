import React from 'react';

const FilterBar = ({ selectedType, onTypeChange, selectedSort, onSortChange }) => {
  const TYPE_OPTIONS = [
    { label: 'All', value: 'All' },
    { label: 'Buy', value: 'Buy' }, // Backend: 'sell'
    { label: 'Rent', value: 'Rent' }, // Backend: 'rent'
  ];

  const SORT_OPTIONS = [
    { label: 'Latest', value: 'latest' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
  ];

  return (
    <div className="filter-bar-container">
      {/* Type Filters */}
      <div className="filter-group">
        <label className="filter-label">Listing Type</label>
        <div className="filter-chips">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-chip ${selectedType === opt.value ? 'active' : ''}`}
              onClick={() => onTypeChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="filter-group">
        <label className="filter-label">Sort By</label>
        <select 
          className="filter-select"
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
