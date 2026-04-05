import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const MyOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
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
              <div key={order?._id} className="order-card">
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
                      <span className="info-label">Price Paid</span>
                      <span className="info-value">${order?.price || 0}</span>
                    </div>
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
                  <div className="order-timestamp" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 'auto' }}>
                    Ordered {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
