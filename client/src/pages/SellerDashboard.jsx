import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const SellerDashboard = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/orders/seller-orders', {
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
        console.error('Fetch Seller Orders Error:', err);
        setError(err.response?.data?.message || 'Unable to load seller analytics. Check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [navigate]);

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    
    // Store original state for fallback if needed (though we'll just handle error)
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update state locally (Optimistic UI)
      setOrders((prevOrders) => 
        prevOrders.map((order) => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(`Error updating status: ${err.response?.data?.message || err.message}`);
    }
  };

  const renderActionButtons = (order) => {
    const status = order.status || 'pending';

    if (status === 'pending') {
      return (
        <div className="action-buttons">
          <button onClick={() => updateOrderStatus(order._id, 'confirmed')} className="btn-action btn-confirm">Confirm →</button>
          <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="btn-action btn-cancel">Cancel</button>
        </div>
      );
    }

    if (status === 'confirmed') {
      return (
        <div className="action-buttons">
          <button onClick={() => updateOrderStatus(order._id, 'completed')} className="btn-action btn-complete">Complete ✅</button>
          <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="btn-action btn-cancel">Cancel</button>
        </div>
      );
    }

    return null; // No actions for completed/cancelled
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <p className="loading-text">Loading seller dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const totalCompleted = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <span className="dashboard-eyebrow">Sales & Logistics</span>
          <h1 className="dashboard-title">Seller Dashboard</h1>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Listings</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending / Active</span>
            <span className="stat-value">{activeOrdersCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Successfully Sold</span>
            <span className="stat-value">{totalCompleted}</span>
          </div>
        </section>

        {error && (
          <div className="error-banner" style={{ color: 'var(--error)', marginBottom: '2rem', padding: '1rem', background: '#fff5f5', borderRadius: '12px', border: '1.5px solid var(--error)' }}>
            ⚠ {error}
          </div>
        )}

        <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Order Activity</h2>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📮</div>
            <h2 className="empty-text">No orders yet</h2>
            <p className="empty-sub">Once students start buying or renting your items, they'll appear here.</p>
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
                      <span className="info-label">Buyer Details</span>
                      <span className="info-value">{order?.user?.name || 'Anonymous'}</span>
                      <span className="info-value" style={{ fontSize: '0.75rem', fontWeight: 400 }}>{order?.user?.email}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="info-label">Earnings</span>
                      <span className="info-value">${order?.price || 0}</span>
                    </div>
                    {order?.type === 'rent' && (order?.rentStartDate || order?.rentEndDate) && (
                      <div className="order-info-item">
                        <span className="info-label">Rental Period</span>
                        <span className="info-value" style={{ fontSize: '0.8rem' }}>
                          {order?.rentStartDate ? new Date(order.rentStartDate).toLocaleDateString() : 'N/A'} - {order?.rentEndDate ? new Date(order.rentEndDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-actions-side">
                  <span className={`status-badge status-${order?.status || 'pending'}`}>
                    {order?.status || 'pending'}
                  </span>
                  {renderActionButtons(order)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
