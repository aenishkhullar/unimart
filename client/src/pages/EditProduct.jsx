import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        type: 'sell',
        rentDuration: '',
        deposit: ''
    });
    
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/${id}`);
                const product = res.data.data || res.data;
                setFormData({
                    title: product.title || '',
                    description: product.description || '',
                    price: product.price || '',
                    category: product.category || '',
                    type: product.type || 'sell',
                    rentDuration: product.rentDuration || '',
                    deposit: product.deposit || ''
                });
                setFetchLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch product details.');
                setFetchLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to edit a product.');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const payload = { ...formData };
            if (payload.type === 'sell') {
                payload.rentDuration = '';
                payload.deposit = '';
            }

            const res = await axios.put(`http://localhost:5000/api/products/${id}`, payload, config);

            if (res.data) {
                setSuccess('Product updated successfully!');
                setTimeout(() => {
                    navigate(`/product/${id}`);
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <h2 style={{ color: '#555', fontFamily: 'sans-serif' }}>Loading product details...</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '24px' }}>Edit Product</h2>
            
            {error && <div style={{ color: '#d9534f', backgroundColor: '#fdf7f7', border: '1px solid #d9534f', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
            {success && <div style={{ color: '#5cb85c', backgroundColor: '#f4fdf4', border: '1px solid #5cb85c', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Title:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', transition: 'border-color 0.3s' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Description:</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required 
                        rows="4"
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', resize: 'vertical' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Price:</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Category:</label>
                        <input 
                            type="text" 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Type:</label>
                    <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', backgroundColor: '#fff' }}
                    >
                        <option value="sell">Sell</option>
                        <option value="rent">Rent</option>
                    </select>
                </div>

                {formData.type === 'rent' && (
                    <div style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px dashed #ccc' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Rent Duration:</label>
                            <input 
                                type="text" 
                                name="rentDuration" 
                                value={formData.rentDuration} 
                                onChange={handleChange} 
                                required={formData.type === 'rent'} 
                                placeholder="e.g., 1 month"
                                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Deposit:</label>
                            <input 
                                type="number" 
                                name="deposit" 
                                value={formData.deposit} 
                                onChange={handleChange} 
                                required={formData.type === 'rent'} 
                                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '14px', 
                        backgroundColor: loading ? '#f3ce5c' : '#ffc107', 
                        color: '#212529', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        marginTop: '10px',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {loading ? 'Updating Product...' : 'Update Product'}
                </button>
            </form>
        </div>
    );
};

export default EditProduct;
