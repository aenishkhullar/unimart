import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import CategoryNav from '../components/CategoryNav';
import ProductGrid from '../components/ProductGrid';
import './Browse.css';

const CATEGORIES = [
  'Books',
  'Electronics',
  'Clothing',
  'Lifestyle',
  'Dorm Essentials',
  'Stationery',
  'Others',
  'Transport',
];

const CATEGORY_MAP = {
  'books': 'Books',
  'electronics': 'Electronics',
  'clothing': 'Clothing',
  'lifestyle': 'Lifestyle',
  'dorm essentials': 'Dorm Essentials',
  'stationery': 'Stationery',
  'others': 'Others',
  'transport': 'Transport',
};

const Browse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [visibleCounts, setVisibleCounts] = useState(
    CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 8 }), {})
  );

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Map UI "Buy" -> backend "sell"
      const mappedType = selectedType === 'Buy' ? 'sell' : selectedType === 'Rent' ? 'rent' : '';
      
      // Build query params
      const apiParams = new URLSearchParams();
      if (debouncedQuery) apiParams.append('keyword', debouncedQuery);
      if (mappedType) apiParams.append('type', mappedType);
      if (selectedCategory) apiParams.append('category', selectedCategory);

      const res = await axios.get(`http://localhost:5000/api/products?${apiParams.toString()}`);
      setProducts(res.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedType, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Search Debounce (triggered by SearchBar component internally, but we sync state here)
  const handleSearch = (q) => {
    setDebouncedQuery(q);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedType('All');
    setSelectedSort('latest');
    // Reset visible counts
    setVisibleCounts(CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 8 }), {}));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Normalization and Grouping Logic
  const groupedProducts = useMemo(() => {
    const normalize = (str) => str?.toLowerCase().trim();
    
    // 1. Filter by category (if needed, but here we show all sections)
    // 2. Group into sections
    const groups = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});

    products.forEach((product) => {
      const normCat = normalize(product.category);
      // Try exact map first, then case-insensitive check against CATEGORIES
      const targetCat = CATEGORY_MAP[normCat] || 
                        CATEGORIES.find(c => c.toLowerCase() === normCat) || 
                        'Others';
      
      if (groups[targetCat]) {
        groups[targetCat].push(product);
      } else {
        // Final fallback to Others
        groups['Others'].push(product);
      }
    });

    // 3. Sort each group
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => {
        if (selectedSort === 'price_asc') return a.price - b.price;
        if (selectedSort === 'price_desc') return b.price - a.price;
        // Default: latest (assuming _id or createdAt)
        return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
      });
    });

    return groups;
  }, [products, selectedSort]);

  // Dynamic Load More Logic
  const handleLoadMore = (cat) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [cat]: prev[cat] + 8,
    }));
  };

  // Smooth Scroll Navigation
  const scrollToCategory = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryNavClick = (id) => {
    const originalCat = CATEGORIES.find(c => c.toLowerCase().replace(/\s+/g, '-') === id);
    if (originalCat) {
      navigate(`/browse?category=${encodeURIComponent(originalCat)}`);
    } else {
      scrollToCategory(id);
    }
  };

  const handleAllClick = () => {
    if (selectedCategory) {
      navigate('/browse');
    } else {
      scrollToTop();
    }
  };

  const totalResults = products.length;

  return (
    <div className="browse-page">
      {/* ━━━━━━━━━━━━━━━━ Top Sticky Section ━━━━━━━━━━━━━━━━ */}
      <header className="browse-header-sticky">
        <div className="browse-header-inner">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          <FilterBar
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
          />
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━ Category Navigation ━━━━━━━━━━━━━━━━ */}
      <CategoryNav 
        categories={CATEGORIES} 
        onCategoryClick={handleCategoryNavClick} 
        onAllClick={handleAllClick} 
        currentCategory={selectedCategory}
      />

      {/* ━━━━━━━━━━━━━━━━ Main Content ━━━━━━━━━━━━━━━━ */}
      <main className="container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Updating listings...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2 className="empty-state-title">No products found</h2>
            <p className="empty-state-desc">Try adjusting your filters or search terms.</p>
            <button className="btn-reset-filters" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="sections-container">
            {CATEGORIES.map((cat) => {
              const catProducts = groupedProducts[cat];
              if (!catProducts || catProducts.length === 0) return null;

              const visibleProducts = catProducts.slice(0, visibleCounts[cat]);
              const hasMore = catProducts.length > visibleCounts[cat];
              const sectionId = cat.toLowerCase().replace(/\s+/g, '-');

              return (
                <section key={cat} id={sectionId} className="category-section">
                  <div className="category-section-header">
                    <h2 className="category-title">{cat}</h2>
                    <div className="results-count">{catProducts.length} items</div>
                  </div>
                  
                  <ProductGrid products={visibleProducts} />

                  {hasMore && (
                    <div className="load-more-wrapper">
                      <button 
                        className="btn-load-more"
                        onClick={() => handleLoadMore(cat)}
                      >
                        Load More {cat} →
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
