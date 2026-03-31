import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: '#495057', textDecoration: 'none', fontWeight: 'bold', padding: '10px 16px', backgroundColor: '#e9ecef', borderRadius: '6px', transition: 'background-color 0.2s' }}>
                    &larr; Back to Products
                </Link>
                
                {currentUser && product.user && currentUser._id === product.user._id && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to={`/edit-product/${product._id}`} style={{ padding: '10px 16px', backgroundColor: '#ffc107', color: '#212529', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                            Edit
                        </Link>
                        <button onClick={handleDelete} style={{ padding: '10px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
