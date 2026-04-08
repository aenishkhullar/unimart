import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const MyOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Safe extraction from res.data.orders
        const ordersData = Array.isArray(res.data?.orders) ? res.data.orders : [];
        
        // Final Sort by latest first (createdAt DESC)
        const sortedOrders = [...ordersData].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setOrders(sortedOrders);
      } catch (err) {
        console.error('Fetch Orders Error:', err);
        setError(err.response?.data?.message || 'Unable to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = Array.isArray(res.data?.orders) ? res.data.orders : [];
      const sortedOrders = [...ordersData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Refresh Orders Error:', err);
    }
  };

  const handleReviewSubmit = async (productId, orderId) => {
    if (!rating || !comment) {
      alert("Please provide both a rating and a comment.");
      return;
    }

    setReviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/reviews/${productId}`, {
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Review submitted successfully!");
      setActiveReviewId(null);
      setRating(0);
      setComment("");
      fetchOrders(); // Refresh to update isReviewed status
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditClick = (order) => {
    setEditingReviewId(order.review._id);
    setEditingOrderId(order._id);
    setRating(order.review.rating);
    setComment(order.review.comment);
    setActiveReviewId(null); // Close any open "Add Review" form
  };

  const handleUpdateReview = async () => {
    if (!rating || !comment) {
      alert("Please provide both a rating and a comment.");
      return;
    }

    setReviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/reviews/${editingReviewId}`, {
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Review updated successfully!");
      setEditingReviewId(null);
      setEditingOrderId(null);
      setRating(0);
      setComment("");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviewLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Review deleted successfully!");
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete review.");
      } finally {
        setReviewLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <p className="loading-text">Loading your order history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <span className="dashboard-eyebrow">Inventory & History</span>
          <h1 className="dashboard-title">My Orders</h1>
        </header>

        {error && (
          <div className="error-banner" style={{ color: 'var(--error)', marginBottom: '2rem', padding: '1rem', background: '#fff5f5', borderRadius: '12px', border: '1.5px solid var(--error)' }}>
            ⚠ {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2 className="empty-text">No orders yet</h2>
            <p className="empty-sub">Explore the curated campus marketplace and find your next deal.</p>
            <Link to="/" className="btn-hero-primary">Start Shopping →</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <React.Fragment key={order?._id}>
                <div className="order-card">
                <div className="order-img-wrapper">
                    <img 
                      src={order?.product?.image || "https://via.placeholder.com/300"} 
                      alt="product" 
                      className="product-image" 
                    />
                </div>
                
                <div className="order-details">
                  <div className="order-meta">
                    <span className="order-category">{order?.product?.category || 'General'}</span>
                    <span className={`card-type-badge ${order?.type === 'rent' ? 'rent' : 'sell'}`}>
                      {order?.type === 'rent' ? 'Rent' : 'Buy'}
                    </span>
                  </div>
                  <h3 className="order-title">{order?.product?.title || 'Unknown Product'}</h3>
                  
                  <div className="order-info-row">
                    <div className="order-info-item">
                      <span className="info-label">{order?.type === 'rent' ? 'Total Amount' : 'Price Paid'}</span>
                      <span className="info-value">₹ {order?.totalAmount || order?.price || 0}</span>
                    </div>
                    {order?.type === 'rent' && (
                      <>
                        <div className="order-info-item">
                          <span className="info-label">Security Deposit</span>
                          <span className="info-value">₹ {order?.deposit || 0}</span>
                        </div>
                        <div className="order-info-item">
                          <span className="info-label">Duration</span>
                          <span className="info-value">{order?.rentDuration} days</span>
                        </div>
                      </>
                    )}
                    {order?.type === 'rent' && (order?.rentStartDate || order?.rentEndDate) && (
                      <>
                        <div className="order-info-item">
                          <span className="info-label">Start Date</span>
                          <span className="info-value">{order?.rentStartDate ? new Date(order.rentStartDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="order-info-item">
                          <span className="info-label">End Date</span>
                          <span className="info-value">{order?.rentEndDate ? new Date(order.rentEndDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </>
                    )}
                    <div className="order-info-item">
                      <span className="info-label">Order ID</span>
                      <span className="info-value">#{order?._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions-side">
                  <span className={`status-badge status-${order?.status || 'pending'}`}>
                    {order?.status || 'pending'}
                  </span>
                  
                  {order?.status === 'completed' && !order?.isReviewed && (
                    <button 
                      className="btn-review-trigger"
                      onClick={() => setActiveReviewId(activeReviewId === order._id ? null : order._id)}
                    >
                      {activeReviewId === order._id ? 'Cancel' : 'Write Review'}
                    </button>
                  )}

                  {order?.isReviewed && (
                    <div className="review-display-actions" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className="reviewed-badge" style={{ display: 'block' }}>⭐ Rated: {order.review.rating}/5</span>
                      <div className="review-btn-group" style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-review-trigger" 
                            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                            onClick={() => handleEditClick(order)}
                            disabled={reviewLoading}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-review-trigger" 
                            style={{ fontSize: '0.7rem', padding: '4px 8px', borderColor: 'var(--error)', color: 'var(--error)' }}
                            onClick={() => handleDeleteReview(order.review._id)}
                            disabled={reviewLoading}
                          >
                            Delete
                          </button>
                      </div>
                    </div>
                  )}

                  <div className="order-timestamp" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 'auto' }}>
                    Ordered {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Inline Review/Edit Form */}
              {(activeReviewId === order._id || editingOrderId === order._id) && (
                <div className="inline-review-form">
                  <div className="review-form-header">
                    <h4>{editingOrderId === order._id ? "Edit your review" : "Review your purchase"}</h4>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    className="review-textarea"
                    placeholder="How was the product? Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-submit-review"
                      onClick={() => editingOrderId === order._id ? handleUpdateReview() : handleReviewSubmit(order.product._id, order._id)}
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? (editingOrderId === order._id ? 'Updating...' : 'Posting...') : (editingOrderId === order._id ? 'Update Review' : 'Submit Feedback')}
                    </button>
                    {(activeReviewId === order._id || editingOrderId === order._id) && (
                      <button 
                        className="btn-submit-review" 
                        style={{ background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }}
                        onClick={() => {
                          setActiveReviewId(null);
                          setEditingOrderId(null);
                          setEditingReviewId(null);
                          setRating(0);
                          setComment("");
                        }}
                        disabled={reviewLoading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
