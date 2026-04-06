import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div
      className="product-listing-card"
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product._id || product.id}`)}
    >
      <div className="product-listing-image-wrapper">
        <span className={`listing-type-badge ${product.type === 'rent' ? 'rent' : 'sell'}`}>
          {product.type === 'rent' ? 'RENT' : 'BUY'}
        </span>
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
          <div className="product-listing-price">${product.price}</div>
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
