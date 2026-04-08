import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isAnimating, setIsAnimating] = useState(false);
    
    const [product, setProduct] = useState(null);
    // ... other states ...
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderStatus, setOrderStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [orderMessage, setOrderMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [productOrders, setProductOrders] = useState([]);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [rentDays, setRentDays] = useState(0);
    const [contactingSeller, setContactingSeller] = useState(false);
    
    // Review States
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    const today = new Date().toISOString().split('T')[0];
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(res.data.data || res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch product details.');
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchProductOrders = async () => {
            if (product && currentUser && product.user && currentUser._id === (product.user._id || product.user)) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/orders/product/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setProductOrders(res.data.orders);
                } catch (err) {
                    console.error('Failed to fetch product orders:', err);
                }
            }
        };
        fetchProductOrders();
    }, [product, currentUser, id]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
            setReviews(res.data.reviews || []);
            setAvgRating(res.data.avgRating || 0);
            setReviewCount(res.data.count || 0);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [id]);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start < end) {
                const diffTime = Math.abs(end - start);
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setRentDays(days);
            } else {
                setRentDays(0);
            }
        } else {
            setRentDays(0);
        }
    }, [startDate, endDate]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/products/${id}`, config);
                navigate('/browse'); // Redirect to browse after deletion
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete product.');
            }
        }
    };

    const handleOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setOrderMessage('Please log in to place an order.');
            setOrderStatus('error');
            return;
        }
        setOrderStatus('loading');
        setOrderMessage('');
        const payload = { productId: product._id };
        
        if (product.type === 'rent') {
            if (!startDate || !endDate) {
                setOrderMessage('Please select both start and end dates.');
                setOrderStatus('error');
                return;
            }
            if (new Date(startDate) >= new Date(endDate)) {
                setOrderMessage('End date must be after start date.');
                setOrderStatus('error');
                return;
            }
            payload.rentStartDate = startDate;
            payload.rentEndDate = endDate;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/orders', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderStatus('success');
            setOrderMessage(res.data.message || 'Order created successfully!');
        } catch (err) {
            setOrderStatus('error');
            setOrderMessage(err.response?.data?.message || 'Failed to place order.');
        }
    };

    const handleContactSeller = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setContactingSeller(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/chat/${product._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/messages/${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to start conversation.');
        } finally {
            setContactingSeller(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
                status: newStatus 
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setProductOrders(prev => prev.filter(order => order._id !== orderId));
            alert(res.data.message || `Order ${newStatus} successfully!`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const submitReview = async () => {
        // Removed as per transaction-based review requirement
        alert("Reviews can only be added from the My Orders page after a completed purchase.");
    };

    if (loading) {
        return (
            <div className="product-details-page error-vibe">
                <span className="loading-spinner"></span>
                <p>Loading curated details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-details-page error-vibe">
                <h2>Product not found.</h2>
                <p>{error || "The item you're looking for doesn't exist."}</p>
                <Link to="/browse" className="btn-primary-action" style={{ maxWidth: '200px', margin: '2rem auto' }}>
                    Browse Listings
                </Link>
            </div>
        );
    }

    const isOwner = currentUser && product.user && (currentUser._id === (product.user._id || product.user));
    const seller = product.user || {};
    const formattedPrice = `₹ ${product.price}`;

    return (
        <div className="product-details-page">
            <div className="product-details-container">
                
                {/* ─── Grid: Image & Primary Info ─── */}
                <div className="product-details-grid">
                    
                    {/* Left: Image */}
                    <div className="product-image-frame">
                        <img 
                            src={product.image || "/placeholder-product.png"} 
                            alt={product.title}
                            className="product-main-img"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/600?text=No+Image+Available"; }}
                        />
                    </div>

                    {/* Right: Info */}
                    <div className="product-info-panel">
                        {product.category === 'Transport' && (
                            <div style={{background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span>⚠️</span> Valid driving license required to purchase/rent this item.
                            </div>
                        )}
                        <div className="info-header-meta">
                            <span className="badge badge-category">{product.category}</span>
                            <span className="badge badge-type">{product.type.toUpperCase()}</span>
                            <span className="trust-rating">
                                {reviewCount > 0 ? (
                                    <>⭐ {(avgRating || 0).toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</>
                                ) : (
                                    <>⭐ No reviews yet</>
                                )}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 className="product-details-title">{product.title}</h1>
                            <button
                                className={`bookmark-btn-large ${isInWishlist(product._id) ? 'saved' : ''} ${isAnimating ? 'animating' : ''}`}
                                onClick={async () => {
                                    setIsAnimating(true);
                                    await toggleWishlist(product._id);
                                    setTimeout(() => setIsAnimating(false), 300);
                                }}
                                aria-label={isInWishlist(product._id) ? "Remove from saved" : "Save item"}
                            >
                                {isInWishlist(product._id) ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                        <path d="M5 5v14l7-4 7 4V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                                        <path d="M5 5v14l7-4 7 4V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        <div className="price-display">
                            <span className="price-value">
                                {product.type === 'rent' ? `₹ ${product.rentPrice}` : formattedPrice}
                            </span>
                            {product.type === 'rent' && <span className="price-suffix"> / day</span>}
                        </div>

                        <div className="seller-card-mini" onClick={() => navigate(`/seller/${seller._id}`)} style={{ cursor: 'pointer' }}>
                            <div className="seller-avatar-initials">
                                {(seller.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="seller-details">
                                <h4>SOLD BY</h4>
                                <p>
                                    {seller.name || 'Unknown Seller'}
                                    {seller.badge && (
                                        <span className="seller-badge" style={{ marginLeft: '8px' }}>{seller.badge}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="action-area">
                            {isOwner ? (
                                <>
                                    <Link to={`/edit-product/${product._id}`} className="btn-primary-action">
                                        Edit Listing
                                    </Link>
                                    <button onClick={handleDelete} className="btn-secondary-action btn-owner-delete">
                                        Remove Listing
                                    </button>
                                </>
                            ) : (
                                <>
                                    {product.type === 'rent' && (
                                        <>
                                            <div style={{background: '#e2e3e5', color: '#383d41', padding: '8px 12px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                                <span>ℹ️</span> Security deposit is refundable after successful return.
                                            </div>
                                            <div className="rent-input-group">
                                                <div className="rent-input-field">
                                                    <label>START DATE</label>
                                                    <input type="date" min={today} value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                                                </div>
                                                <div className="rent-input-field">
                                                    <label>END DATE</label>
                                                    <input type="date" min={startDate || today} value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                                                </div>
                                            </div>

                                            {rentDays > 0 && (
                                                <div className="pricing-breakdown">
                                                    <div className="breakdown-row">
                                                        <span>Rent ({rentDays} days)</span>
                                                        <span>₹ {product.rentPrice * rentDays}</span>
                                                    </div>
                                                    <div className="breakdown-row">
                                                        <span>Security Deposit</span>
                                                        <span>₹ {product.deposit}</span>
                                                    </div>
                                                    <div className="breakdown-row total">
                                                        <span>Total Amount</span>
                                                        <span>₹ { (product.rentPrice * rentDays) + (product.deposit || 0) }</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {rentDays === 0 && (
                                                <div style={{background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem'}}>
                                                    Please select rental duration before proceeding.
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <button 
                                        className="btn-primary-action"
                                        onClick={handleOrder}
                                        disabled={orderStatus === 'loading' || orderStatus === 'success' || (product.type === 'rent' && rentDays === 0)}
                                    >
                                        {orderStatus === 'loading' 
                                            ? 'Requesting...' 
                                            : product.type === 'rent' ? 'Request to Rent' : 'Instant Purchase'}
                                    </button>

                                    <button 
                                        onClick={handleContactSeller} 
                                        className="btn-secondary-action" 
                                        disabled={contactingSeller}
                                    >
                                        {contactingSeller ? 'Connecting...' : 'Message Seller'}
                                    </button>

                                    {orderMessage && (
                                        <div className={`form-message ${orderStatus === 'success' ? 'success' : 'error'}`}>
                                            {orderMessage}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Extended Details ─── */}
                <div className="details-extended">
                    <h3 className="section-label">Product Description</h3>
                    <p className="product-desc-text">
                        {product.description || "The seller hasn't provided a detailed description for this item."}
                    </p>

                    <div className="posted-date">
                        Posted on: {new Date(product.createdAt || Date.now()).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                </div>

                {/* ─── Reviews & Feedback Section ─── */}
                <div className="reviews-master-container">
                    <div className="reviews-header">
                        <h3 className="section-label">Community Feedback</h3>
                        {reviewCount > 0 && <span className="overall-score">⭐ {(avgRating || 0).toFixed(1)} Average</span>}
                    </div>

                    <div className="reviews-layout">
                        {/* Notice: Reviews are only allowed after purchase */}
                        <div className="review-notice-panel">
                            <div className="notice-icon">🛍️</div>
                            <h3>Share Your Experience</h3>
                            <p>To ensure authentic feedback, reviews can only be submitted by verified buyers after the order is completed.</p>
                            {!currentUser && <p className="login-link">Please <Link to="/login">login</Link> to view your purchase history.</p>}
                            {currentUser && !isOwner && (
                                <Link to="/my-orders" className="btn-secondary-action" style={{ textAlign: 'center', display: 'block', marginTop: '1rem' }}>
                                    View My Purchases
                                </Link>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="reviews-list-container">
                            {reviews.length === 0 ? (
                                <div className="empty-reviews-state">
                                    <div className="empty-icon">💬</div>
                                    <p>No reviews yet. Be the first to review after purchase!</p>
                                </div>
                            ) : (
                                reviews.map((rev) => (
                                    <div key={rev._id} className="review-item-card">
                                        <div className="review-card-header">
                                            <div className="reviewer-info">
                                                <strong>{rev.user?.name || "Anonymous User"}</strong>
                                                <span className="review-date">
                                                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="review-stars">
                                                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                            </div>
                                        </div>
                                        <p className="review-comment-text">{rev.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Seller Management Section ─── */}
                {isOwner && productOrders.length > 0 && (
                    <div className="pending-orders-section">
                        <h3 className="section-label">📋 Incoming Purchase Requests</h3>
                        <div className="order-cards-container">
                            {productOrders.map(order => (
                                <div key={order._id} className="order-card-compact">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '1.1rem' }}>{order.user.name}</strong>
                                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{order.user.email}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>₹{order.price}</span>
                                        </div>
                                    </div>
                                    {order.type === 'rent' && (
                                        <div style={{ background: 'var(--surface-low)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                            🗓️ {new Date(order.rentStartDate).toLocaleDateString()} - {new Date(order.rentEndDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="btn-primary-action" 
                                            style={{ padding: '0.75rem' }}
                                            onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                                            disabled={updatingOrderId === order._id}
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            className="btn-secondary-action" 
                                            style={{ padding: '0.75rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                            disabled={updatingOrderId === order._id}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
