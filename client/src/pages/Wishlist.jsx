import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Browse.css'; // Reuse Browse styles if appropriate, or create specific ones

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch wishlist items');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  if (loading) {
    return (
      <div className="browse-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching your saved items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Your Collection</div>
            <h2 className="section-title">Saved Items</h2>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--surface)', borderRadius: '16px', marginTop: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>No saved items yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Items you bookmark will appear here for easy access.</p>
            <button 
              className="btn-hero-primary" 
              style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 2rem' }}
              onClick={() => window.location.href = '/browse'}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="product-grid" style={{ marginTop: '2rem' }}>
            {wishlistItems.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
