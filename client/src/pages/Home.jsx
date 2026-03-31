import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // The backend endpoint from context is GET /api/products
                const res = await axios.get('http://localhost:5000/api/products');
                
                // Assuming the response structure is { success: true, count: X, data: [products] }
                // as seen in previous MERN setups by the user
                setProducts(res.data.data || res.data || []);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', fontFamily: 'sans-serif' }}>
                <h2>Loading products...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', color: 'red', marginTop: '50px', fontFamily: 'sans-serif' }}>
                <h2>Error: {error}</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Explore Products</h1>
            
            {products.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>No products found.</p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '25px' 
                }}>
                    {products.map((product) => (
                        <div 
                            key={product._id || product.id} 
                            onClick={() => navigate(`/product/${product._id || product.id}`)}
                            style={{ 
                            border: '1px solid #eee', 
                            borderRadius: '10px', 
                            padding: '20px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#222', fontSize: '1.2rem' }}>
                                    {product.title}
                                </h3>
                                
                                <p style={{ margin: '10px 0', color: '#28a745', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    ${product.price}
                                </p>
                            </div>
                            
                            <div style={{ marginTop: '15px' }}>
                                <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    backgroundColor: product.type === 'rent' ? '#e3f2fd' : '#e8f5e9',
                                    color: product.type === 'rent' ? '#1565c0' : '#2e7d32',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {product.type || 'Sell'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
