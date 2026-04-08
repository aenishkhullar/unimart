import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const productId = product._id || product.id;
  const isSaved = isInWishlist(productId);

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    await toggleWishlist(productId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      className="product-listing-card"
      onClick={() => navigate(`/product/${productId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${productId}`)}
    >
      <div className="product-listing-image-wrapper">
        <span className={`listing-type-badge ${product.type === 'rent' ? 'rent' : 'sell'}`}>
          {product.type === 'rent' ? 'RENT' : 'BUY'}
        </span>
        
        {/* Bookmark Button */}
        <button
          className={`bookmark-btn ${isSaved ? 'saved' : ''} ${isAnimating ? 'animating' : ''}`}
          onClick={handleBookmarkClick}
          aria-label={isSaved ? "Remove from saved" : "Save item"}
        >
          {isSaved ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M5 5v14l7-4 7 4V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M5 5v14l7-4 7 4V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
            </svg>
          )}
        </button>

        <img
          src={product.image || 'https://via.placeholder.com/300?text=No+Image'}
          alt={product.title}
          className="product-listing-img"
        />
      </div>
      <div className="product-listing-content">
        <div className="product-listing-category">{product.category || 'Other'}</div>
        <h3 className="product-listing-title">{product.title}</h3>
        <div className="product-listing-footer">
          <div className="product-listing-price">
              ₹{product.type === 'rent' ? product.rentPrice || product.price : product.price}
          </div>
          <button 
            className="btn-listing-details"
            onClick={handleDetailsClick}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
