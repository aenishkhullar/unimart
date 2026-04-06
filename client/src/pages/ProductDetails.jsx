import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderStatus, setOrderStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [orderMessage, setOrderMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [productOrders, setProductOrders] = useState([]);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
                        <div className="info-header-meta">
                            <span className="badge badge-category">{product.category}</span>
                            <span className="badge badge-type">{product.type.toUpperCase()}</span>
                            <span className="trust-rating">⭐ No reviews yet</span>
                        </div>

                        <h1 className="product-details-title">{product.title}</h1>
                        
                        <div className="price-display">
                            <span className="price-value">{formattedPrice}</span>
                            {product.type === 'rent' && <span className="price-suffix"> / cycle</span>}
                        </div>

                        <div className="seller-card-mini">
                            <div className="seller-avatar-initials">
                                {(seller.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="seller-details">
                                <h4>SOLD BY</h4>
                                <p>{seller.name || 'Unknown Seller'}</p>
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
                                    )}

                                    <button 
                                        className="btn-primary-action"
                                        onClick={handleOrder}
                                        disabled={orderStatus === 'loading' || orderStatus === 'success'}
                                    >
                                        {orderStatus === 'loading' 
                                            ? 'Requesting...' 
                                            : product.type === 'rent' ? 'Request to Rent' : 'Instant Purchase'}
                                    </button>

                                    <a href={`mailto:${seller.email}`} className="btn-secondary-action">
                                        Contact Seller
                                    </a>

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
