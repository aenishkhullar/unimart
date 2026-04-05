import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        if (product && product.user && currentUser) {
            console.log('loggedInUser._id:', currentUser._id);
            console.log('product.user._id:', product.user._id);
        }
    }, [product, currentUser]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Adjust port/URL if necessary. Using localhost:5000 based on typical MERN setups.
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
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                await axios.delete(`http://localhost:5000/api/products/${id}`, config);
                navigate('/');
            } catch (err) {
                console.error('Failed to delete product:', err);
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
            const res = await axios.post(
                'http://localhost:5000/api/orders',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
            const res = await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state to reflect change
            setProductOrders(prev => prev.filter(order => order._id !== orderId));
            alert(res.data.message || `Order ${newStatus} successfully!`);
        } catch (err) {
            console.error('Failed to update order status:', err);
            alert(err.response?.data?.message || 'Failed to update order status.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <h2 style={{ color: '#555', fontFamily: 'sans-serif' }}>Loading product details...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', backgroundColor: '#fff3f3', border: '1px solid #ffcccc', borderRadius: '8px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2 style={{ color: '#d9534f', margin: '0 0 15px 0' }}>Error</h2>
                <p style={{ color: '#555', margin: '0 0 20px 0' }}>{error}</p>
                <Link to="/" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>Back to Home</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
                <h2>Product not found.</h2>
                <Link to="/" style={{ color: '#007bff' }}>Back to Home</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
            <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '24px', marginBottom: '24px' }}>
                <h1 style={{ color: '#2c3e50', margin: '0 0 16px 0', fontSize: '32px', lineHeight: '1.2' }}>{product.title}</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: '#e9ecef', color: '#495057', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                        {product.category}
                    </span>
                    <span style={{ 
                        backgroundColor: product.type === 'rent' ? '#d1ecf1' : '#d4edda', 
                        color: product.type === 'rent' ? '#0c5460' : '#155724', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {product.type}
                    </span>
                </div>
            </div>

            <div className="product-image-container">
                <img 
                    src={product?.image || "https://via.placeholder.com/300"} 
                    alt="product"
                    className="product-main-image"
                />
            </div>

            <div style={{ marginBottom: '36px' }}>
                <h3 style={{ color: '#34495e', marginBottom: '12px', fontSize: '20px' }}>Description</h3>
                <p style={{ lineHeight: '1.8', color: '#555', fontSize: '16px', margin: 0, whiteSpace: 'pre-line' }}>
                    {product.description}
                </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '36px' }}>
                <div style={{ flex: '1 1 200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #007bff' }}>
                    <span style={{ display: 'block', fontSize: '14px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</span>
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>${product.price}</span>
                </div>

                {product.type === 'rent' && (
                    <>
                        <div style={{ flex: '1 1 200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #17a2b8' }}>
                            <span style={{ display: 'block', fontSize: '14px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rent Duration</span>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#343a40' }}>{product.rentDuration}</span>
                        </div>
                        <div style={{ flex: '1 1 200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ffc107' }}>
                            <span style={{ display: 'block', fontSize: '14px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deposit</span>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#343a40' }}>${product.deposit}</span>
                        </div>
                    </>
                )}
            </div>

            {product.user && (
                <div style={{ backgroundColor: '#fdfdfd', border: '1px solid #e9ecef', padding: '24px', borderRadius: '10px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#34495e', fontSize: '20px' }}>Seller Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#495057', fontSize: '16px' }}>
                        <div><strong style={{ display: 'inline-block', width: '60px' }}>Name:</strong> {product.user.name}</div>
                        <div><strong style={{ display: 'inline-block', width: '60px' }}>Email:</strong> <a href={`mailto:${product.user.email}`} style={{ color: '#007bff', textDecoration: 'none' }}>{product.user.email}</a></div>
                    </div>
                </div>
            )}

            {/* Pending Orders (Seller View) */}
            {currentUser && product.user && currentUser._id === (product.user._id || product.user) && productOrders.length > 0 && (
                <div style={{ marginTop: '36px', padding: '24px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#34495e', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>📋</span> Pending Orders
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {productOrders.map(order => (
                            <div key={order._id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e9ecef' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2c3e50' }}>{order.user.name}</div>
                                        <div style={{ fontSize: '14px', color: '#6c757d' }}>{order.user.email}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#007bff' }}>${order.price}</div>
                                        <div style={{ fontSize: '12px', color: '#adb5bd' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                {order.type === 'rent' && order.rentStartDate && order.rentEndDate && (
                                    <div style={{ fontSize: '13px', color: '#495057', backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
                                        <strong>Rent:</strong> {new Date(order.rentStartDate).toLocaleDateString()} - {new Date(order.rentEndDate).toLocaleDateString()}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                                        disabled={updatingOrderId === order._id}
                                        style={{ 
                                            flex: 1, 
                                            padding: '8px', 
                                            backgroundColor: '#28a745', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '4px', 
                                            fontWeight: 'bold', 
                                            cursor: updatingOrderId === order._id ? 'not-allowed' : 'pointer',
                                            opacity: updatingOrderId === order._id ? 0.7 : 1
                                        }}
                                    >
                                        Confirm
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                        disabled={updatingOrderId === order._id}
                                        style={{ 
                                            flex: 1, 
                                            padding: '8px', 
                                            backgroundColor: '#dc3545', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '4px', 
                                            fontWeight: 'bold', 
                                            cursor: updatingOrderId === order._id ? 'not-allowed' : 'pointer',
                                            opacity: updatingOrderId === order._id ? 0.7 : 1
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rent Date Selection */}
            {product.type === 'rent' && currentUser && product.user && currentUser._id !== product.user._id && (
                <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f0faff', border: '1px solid #b8daff', borderRadius: '10px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#004085', fontSize: '18px' }}>Select Rent Dates</h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 180px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#495057', fontWeight: 'bold' }}>Start Date</label>
                            <input 
                                type="date" 
                                min={today}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 180px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#495057', fontWeight: 'bold' }}>End Date</label>
                            <input 
                                type="date" 
                                min={startDate || today}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Order Feedback */}
            {orderMessage && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: orderStatus === 'success' ? '#d4edda' : '#f8d7da',
                    color: orderStatus === 'success' ? '#155724' : '#721c24',
                    fontWeight: 'bold',
                    fontSize: '14px',
                }}>
                    {orderMessage}
                </div>
            )}

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: '#495057', textDecoration: 'none', fontWeight: 'bold', padding: '10px 16px', backgroundColor: '#e9ecef', borderRadius: '6px', transition: 'background-color 0.2s' }}>
                    &larr; Back to Products
                </Link>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Buy/Rent button – visible to logged-in non-owners */}
                    {currentUser && product.user && currentUser._id !== product.user._id && (
                        <button
                            id="order-btn"
                            onClick={handleOrder}
                            disabled={orderStatus === 'loading' || orderStatus === 'success'}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: product.type === 'rent' ? '#17a2b8' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: orderStatus === 'loading' || orderStatus === 'success' ? 'not-allowed' : 'pointer',
                                opacity: orderStatus === 'loading' || orderStatus === 'success' ? 0.7 : 1,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {orderStatus === 'loading'
                                ? 'Placing Order…'
                                : product.type === 'rent'
                                ? '📦 Rent Now'
                                : '🛒 Buy Now'}
                        </button>
                    )}

                    {currentUser && product.user && currentUser._id === product.user._id && (
                        <>
                            <Link to={`/edit-product/${product._id}`} style={{ padding: '10px 16px', backgroundColor: '#ffc107', color: '#212529', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                                Edit
                            </Link>
                            <button onClick={handleDelete} style={{ padding: '10px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
