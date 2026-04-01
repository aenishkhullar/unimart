import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    const fetchProducts = async (currentSearch = searchQuery, currentType = selectedType, currentCategory = selectedCategory) => {
        try {
            let queryParams = [];
            if (currentSearch) {
                queryParams.push(`search=${encodeURIComponent(currentSearch)}`);
                queryParams.push(`keyword=${encodeURIComponent(currentSearch)}`);
            }
            if (currentType && currentType !== 'all') queryParams.push(`type=${encodeURIComponent(currentType)}`);
            if (currentCategory) queryParams.push(`category=${encodeURIComponent(currentCategory)}`);
            
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const url = `http://localhost:5000/api/products${queryString}`;
            
            const res = await axios.get(url);
            
            setProducts(res.data.data || res.data || []);
            setLoading(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSubmittedQuery(searchQuery);
        fetchProducts(searchQuery, selectedType, selectedCategory);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim() === '') {
            setSubmittedQuery('');
            fetchProducts('', selectedType, selectedCategory);
        }
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        fetchProducts(searchQuery, type, selectedCategory);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        fetchProducts(searchQuery, selectedType, category);
    };

    if (loading) {
        return (
            <div className="home-container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading your marketplace...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div style={{ fontSize: '1.5rem', color: '#ef4444' }}>Error: {error}</div>
            </div>
        );
    }

    // Prepare Trending Products (first 4-6)
    const trendingProducts = products.slice(0, 6);

    const categories = [
        { name: 'All Categories', value: '', icon: '🌟' },
        { name: 'Books', value: 'Books', icon: '📚' },
        { name: 'Electronics', value: 'Electronics', icon: '💻' },
        { name: 'Accessories', value: 'Accessories', icon: '🎧' },
        { name: 'Hostel Essentials', value: 'Hostel Essentials', icon: '🛏️' },
        { name: 'Others', value: 'Others', icon: '📦' }
    ];

    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <section className="hero-section">
                <h1 className="hero-title">Buy, Sell & Rent on Campus</h1>
                <p className="hero-subtitle">Find books, electronics, and essentials from students near you</p>
                <div className="hero-buttons">
                    <button className="btn-primary" onClick={() => {
                        const el = document.getElementById('search-grid');
                        if(el) el.scrollIntoView({ behavior: 'smooth' });
                    }}>Browse Products</button>
                    <button className="btn-secondary" onClick={() => navigate('/create-product')}>Create Listing</button>
                </div>
            </section>

            {/* SEARCH & FILTERS SECTION */}
            <section className="search-container" id="search-grid">
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Search books, electronics, rentals..." 
                        value={searchQuery}
                        onChange={handleInputChange}
                    />
                    <button type="submit" className="btn-search">Search</button>
                </form>

                <div className="filter-pills">
                    {['all', 'sell', 'rent'].map((type) => (
                        <button
                            key={type}
                            className={`filter-pill ${selectedType === type ? 'active' : ''}`}
                            onClick={() => handleTypeChange(type)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {type}
                        </button>
                    ))}
                    
                    <select 
                        className="category-select" 
                        value={selectedCategory} 
                        onChange={handleCategoryChange}
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </section>
            
            {/* SEARCH QUERY TEXT */}
            {submittedQuery && (
                <div className="search-results-text">
                    Showing results for <span>'{submittedQuery}'</span>
                </div>
            )}

            {/* CATEGORIES SECTION */}
            {!submittedQuery && selectedType === 'all' && selectedCategory === '' && (
                <section>
                    <h2 className="section-title">Explore Categories</h2>
                    <div className="categories-container">
                        {categories.slice(1).map(cat => (
                            <div 
                                key={cat.value} 
                                className="category-card"
                                onClick={() => {
                                    handleCategoryChange({ target: { value: cat.value } });
                                }}
                            >
                                <div className="category-icon">{cat.icon}</div>
                                <div className="category-name">{cat.name}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* TRENDING SECTION */}
            {!submittedQuery && selectedType === 'all' && selectedCategory === '' && trendingProducts.length > 0 && (
                 <section>
                    <div className="trending-header">
                         <h2 className="section-title" style={{ marginBottom: 0 }}>Trending on Campus</h2>
                         <button className="btn-link" onClick={() => {
                             const el = document.getElementById('search-grid');
                             if(el) el.scrollIntoView({ behavior: 'smooth' });
                         }}>View All &rarr;</button>
                    </div>
                    <div className="trending-scroll">
                        {trendingProducts.map(product => (
                            <div 
                                key={`trending-${product._id || product.id}`} 
                                className="product-card"
                                onClick={() => navigate(`/product/${product._id || product.id}`)}
                            >
                                <div className="card-image-wrapper">
                                    <div className={`badge ${product.type === 'rent' ? 'rent' : 'sell'}`}>
                                        {product.type || 'Sell'}
                                    </div>
                                    <div className="card-image-icon">
                                        {product.category === 'Books' ? '📚' : 
                                         product.category === 'Electronics' ? '💻' : 
                                         product.category === 'Accessories' ? '🎧' : 
                                         product.category === 'Hostel Essentials' ? '🛏️' : '🛍️'}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="card-category">{product.category || 'Other'}</div>
                                    <h3 className="card-title">{product.title}</h3>
                                    <div className="card-footer">
                                        <div className="card-price">${product.price}</div>
                                        <button className="btn-view">View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </section>
            )}

            {/* PRODUCT GRID SECTION */}
             <section>
                {(submittedQuery || selectedType !== 'all' || selectedCategory !== '') && (
                    <h2 className="section-title">Found Products</h2>
                )}
                
                {products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <div className="empty-text">No products found</div>
                        <div className="empty-subtext">Try adjusting your filters or search query.</div>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <div 
                                key={product._id || product.id} 
                                className="product-card"
                                onClick={() => navigate(`/product/${product._id || product.id}`)}
                            >
                                <div className="card-image-wrapper">
                                    <div className={`badge ${product.type === 'rent' ? 'rent' : 'sell'}`}>
                                        {product.type || 'Sell'}
                                    </div>
                                    <div className="card-image-icon">
                                        {product.category === 'Books' ? '📚' : 
                                         product.category === 'Electronics' ? '💻' : 
                                         product.category === 'Accessories' ? '🎧' : 
                                         product.category === 'Hostel Essentials' ? '🛏️' : '🛍️'}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="card-category">{product.category || 'Other'}</div>
                                    <h3 className="card-title">{product.title}</h3>
                                    <div className="card-footer">
                                        <div className="card-price">${product.price}</div>
                                        <button className="btn-view">View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </section>
        </div>
    );
};


export default Home;
