import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

function FilterBar({ onFilterChange, items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    stockLevel: 'all'
  });

  // Get unique categories from items
  const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters) => {
    const params = {};
    
    if (currentFilters.category !== 'all') {
      params.category = currentFilters.category;
    }
    
    if (currentFilters.minPrice) {
      params.minPrice = currentFilters.minPrice;
    }
    
    if (currentFilters.maxPrice) {
      params.maxPrice = currentFilters.maxPrice;
    }
    
    // Stock level filters
    if (currentFilters.stockLevel === 'low') {
      params.maxQuantity = 10;
    } else if (currentFilters.stockLevel === 'medium') {
      params.minQuantity = 11;
      params.maxQuantity = 50;
    } else if (currentFilters.stockLevel === 'high') {
      params.minQuantity = 51;
    }
    
    onFilterChange(params);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      stockLevel: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <div className="filter-bar">
      <button 
        className="btn-filter" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        Filters
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h3>Filter Items</h3>
            <button onClick={() => setIsOpen(false)} className="btn-close">
              <X size={18} />
            </button>
          </div>

          <div className="filter-content">
            <div className="filter-group">
              <label>Category</label>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Stock Level</label>
              <select 
                value={filters.stockLevel}
                onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="low">Low (≤ 10)</option>
                <option value="medium">Medium (11-50)</option>
                <option value="high">High (&gt; 50)</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="btn-clear-filters">
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
