import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const SellerDashboard = () => {
  const [orders, setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [verifyingOrderId, setVerifyingOrderId] = useState(null);
  
  // Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProductId, setRestockProductId] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError] = useState('');

  const navigate = useNavigate();

  const fetchSellerData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/orders/seller-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const productsRes = await axios.get('http://localhost:5000/api/products/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Safe extraction from res.data.orders
      const ordersData = Array.isArray(res.data?.orders) ? res.data.orders : [];
      const productsData = Array.isArray(productsRes.data?.data) ? productsRes.data.data : [];
      
      // Final Sort by latest first (createdAt DESC)
      const sortedOrders = [...ordersData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
      setProducts(productsData);
      setTotalEarnings(res.data.totalEarnings || 0);
    } catch (err) {
      console.error('Fetch Seller Data Error:', err);
      setError(err.response?.data?.message || 'Unable to load seller analytics. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []); // Run on mount

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
      
      // Update product stock in UI based on rental lifecycle
      const targetOrder = orders.find(o => o._id === orderId);
      if (targetOrder && targetOrder.type === 'rent') {
        if (newStatus === 'confirmed') {
          // Stock reserved: decrement availableStock
          setProducts(prev => prev.map(p => {
            if (p._id === targetOrder.product?._id) {
              return { ...p, availableStock: Math.max(0, (p.availableStock || 0) - 1) };
            }
            return p;
          }));
        } else if (newStatus === 'returned') {
          // Stock restored: increment availableStock
          setProducts(prev => prev.map(p => {
            if (p._id === targetOrder.product?._id) {
              return { ...p, availableStock: Math.min(p.stock || p.quantity, (p.availableStock || 0) + 1) };
            }
            return p;
          }));
        } else if (newStatus === 'cancelled' && targetOrder.status === 'confirmed') {
          // Cancelling a confirmed order: restore stock
          setProducts(prev => prev.map(p => {
            if (p._id === targetOrder.product?._id) {
              return { ...p, availableStock: Math.min(p.stock || p.quantity, (p.availableStock || 0) + 1) };
            }
            return p;
          }));
        }
      }
      
      // Re-fetch to ensure consistency if needed, or just rely on optimistic update
      // fetchSellerData(); 
    } catch (err) {
      alert(`Error updating status: ${err.response?.data?.message || err.message}`);
    }
  };

  const renderActionButtons = (order) => {
    const status = order.status || 'pending';
    const isRent = order.type === 'rent';

    if (status === 'pending') {
      return (
        <div className="action-buttons">
          <button onClick={() => updateOrderStatus(order._id, 'confirmed')} className="btn-action btn-confirm">Confirm →</button>
          <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="btn-action btn-cancel">Cancel</button>
        </div>
      );
    }

    if (status === 'confirmed') {
      const isTransport = order.product?.category === 'Transport';
      const isLicenseUnverified = isTransport && order.licenseNumber && !order.isLicenseVerified;

      return (
        <div className="action-buttons">
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <button 
              onClick={() => !isLicenseUnverified && updateOrderStatus(order._id, 'completed')} 
              className={`btn-action btn-complete ${isLicenseUnverified ? 'disabled' : ''}`}
              disabled={isLicenseUnverified}
              style={{
                opacity: isLicenseUnverified ? 0.5 : 1,
                cursor: isLicenseUnverified ? 'not-allowed' : 'pointer'
              }}
            >
              Complete ✅
            </button>
            {isLicenseUnverified && (
              <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 700, textAlign: 'right', maxWidth: '150px' }}>
                Verify license before completion
              </span>
            )}
          </div>
          <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="btn-action btn-cancel">Cancel</button>
        </div>
      );
    }

    // For completed RENT orders, show the Return button
    if (status === 'completed' && isRent) {
      return (
        <div className="action-buttons">
          <button onClick={() => updateOrderStatus(order._id, 'returned')} className="btn-action btn-confirm" style={{ background: '#059669', color: '#fff' }}>
            Return 📥
          </button>
        </div>
      );
    }

    return null; // No actions for returned/cancelled/completed-buy
  };

  const handleVerifyLicense = async (orderId) => {
    const token = localStorage.getItem('token');
    setVerifyingOrderId(orderId);
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/verify-license`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, isLicenseVerified: true } : order
        )
      );
    } catch (err) {
      alert(`Error verifying license: ${err.response?.data?.message || err.message}`);
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setRestockError('');
    setRestockLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:5000/api/products/${restockProductId}/restock`, 
        { newStock: Number(restockQuantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update UI instantly
      setProducts(prev => prev.map(p => p._id === restockProductId ? res.data.data || res.data : p));
      
      // Close modal
      setIsRestockModalOpen(false);
      setRestockProductId(null);
      setRestockQuantity(1);
    } catch (err) {
      setRestockError(err.response?.data?.message || 'Failed to restock product.');
    } finally {
      setRestockLoading(false);
    }
  };

  const openRestockModal = (productId) => {
    setRestockProductId(productId);
    setRestockQuantity(1);
    setIsRestockModalOpen(true);
    setRestockError('');
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(prev => prev.filter(p => p._id !== productId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
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

  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'returned' && o.status !== 'cancelled').length;
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
          <div className="stat-card">
            <span className="stat-label">Earnings</span>
            <span className="stat-value">₹ {totalEarnings}</span>
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
                      <span className="info-label">Price</span>
                      <span className="info-value">₹{order?.totalAmount || order?.price || 0}</span>
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

                  {/* License Verification Section for Transport */}
                  {order?.licenseNumber && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: order?.isLicenseVerified ? '#dcfce7' : '#fef3c7',
                      borderRadius: '10px',
                      border: `1.5px solid ${order?.isLicenseVerified ? '#86efac' : '#fde68a'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: order?.isLicenseVerified ? '#166534' : '#92400e', marginBottom: '3px' }}>
                            🪪 Driving License
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 800, color: order?.isLicenseVerified ? '#166534' : '#78350f', letterSpacing: '0.03em' }}>
                            {order.licenseNumber}
                          </div>
                        </div>
                        <div>
                          {order?.isLicenseVerified ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 14px',
                              background: '#166534',
                              color: '#fff',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              letterSpacing: '0.03em'
                            }}>
                                🪪 License Verified ✅
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerifyLicense(order._id)}
                              disabled={verifyingOrderId === order._id}
                              style={{
                                padding: '6px 16px',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: verifyingOrderId === order._id ? 0.6 : 1,
                              }}
                            >
                              {verifyingOrderId === order._id ? 'Verifying...' : 'Mark License as Verified'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-actions-side">
                  <span className={`status-badge status-${order?.status || 'pending'}`}>
                    {order?.status || 'pending'}
                  </span>
                  {renderActionButtons(order)}
                  {(order?.status === 'completed' || order?.status === 'returned') && (
                    <button
                      className="btn-action"
                      style={{ 
                        marginTop: '8px', 
                        borderColor: '#6366f1', 
                        color: '#6366f1', 
                        background: 'white',
                        fontWeight: 600,
                        width: '100%',
                        fontSize: '0.8rem'
                      }}
                      onClick={() => navigate(`/order-receipt/${order._id}`)}
                    >
                      📄 Generate Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="section-title" style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>My Products</h2>

        {products.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-text">No products yet</h2>
            <p className="empty-sub">Create a product to get started.</p>
          </div>
        ) : (
          <div className="orders-list">
            {products.map((product) => (
              <div key={product._id} className="order-card" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="order-img-wrapper">
                    <img 
                      src={product.image || "https://via.placeholder.com/300"} 
                      alt="product" 
                      className="product-image" 
                    />
                </div>
                
                <div className="order-details" style={{ flexGrow: 1 }}>
                  <div className="order-meta">
                    <span className="order-category">{product.category || 'General'}</span>
                    <span className={`card-type-badge ${product.type === 'rent' ? 'rent' : 'sell'}`}>
                      {product.type === 'rent' ? 'Rent' : 'Buy'}
                    </span>
                  </div>
                  <h3 className="order-title">{product.title}</h3>
                  {product.type === 'rent' && (
                    <div className="order-info-row" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                      <div className="order-info-item">
                        <span className="info-label">Total Stock</span>
                        <span className="info-value">{product.stock || 0}</span>
                      </div>
                      <div className="order-info-item">
                        <span className="info-label">Available</span>
                        <span className="info-value">{product.availableStock || 0}</span>
                      </div>
                      <div className="order-info-item">
                        <span className="info-label">Active Rentals</span>
                        <span className="info-value">{(product.stock || 0) - (product.availableStock || 0)}</span>
                      </div>
                    </div>
                  )}
                  <div className="order-info-row">
                    <div className="order-info-item">
                      <span className="info-label">Price</span>
                      <span className="info-value">₹{product.price}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="info-label">Status</span>
                      <span className="info-value" style={{ color: product.isSoldOut ? 'var(--error)' : '#166534', fontWeight: 'bold' }}>
                        {product.isSoldOut ? 'Sold Out' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-actions-side" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => navigate(`/edit-product/${product._id}`)} 
                    className="btn-action"
                    style={{ background: '#f8f9fa', color: '#333', border: '1px solid #ddd' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)} 
                    className="btn-action"
                    style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #f87171' }}
                  >
                    Delete
                  </button>
                  {product.isSoldOut && (
                    <button 
                      onClick={() => openRestockModal(product._id)} 
                      className="btn-action btn-confirm"
                      style={{ background: 'var(--primary)', color: '#fff' }}
                    >
                      Restock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {isRestockModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>Restock Item</h2>
            {restockError && <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.5rem', background: '#fff5f5', borderRadius: '6px' }}>{restockError}</div>}
            <form onSubmit={handleRestockSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>New Stock Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={restockQuantity} 
                  onChange={(e) => setRestockQuantity(e.target.value)} 
                  disabled={restockLoading}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsRestockModalOpen(false)} 
                  disabled={restockLoading}
                  style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#e2e3e5', color: '#333', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={restockLoading}
                  style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'var(--primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {restockLoading ? 'Restocking...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
