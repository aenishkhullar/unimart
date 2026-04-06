import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateProduct.css';

const CATEGORIES = [
  "Books",
  "Dorm Essentials",
  "Electronics",
  "Stationery",
  "Clothing",
  "Lifestyle",
  "Others"
];

const TYPE_MAP = {
  "Sell": "sell",
  "Rent": "rent"
};

const CreateProduct = () => {
    const navigate = useNavigate();

    // Individual states for better control and reset logic
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("Sell");
    const [image, setImage] = useState("");
    const [rentDuration, setRentDuration] = useState("");
    const [deposit, setDeposit] = useState("");

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Validation
        if (!title.trim() || !price || !category) {
            setError("Please fill all required fields (Title, Price, Category)");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to create a product.');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            // 2. Data Mapping & Conversion
            const priceNumber = Number(price);
            const finalType = TYPE_MAP[type];

            const payload = {
                title,
                description,
                price: priceNumber,
                category,
                type: finalType,
                image: image || undefined
            };

            if (finalType === 'rent') {
                payload.rentDuration = rentDuration;
                payload.deposit = Number(deposit);
            }

            // 3. API Call
            const res = await axios.post('http://localhost:5000/api/products', payload, config);

            if (res.data) {
                setSuccess('Product listed successfully!');
                
                // 4. Form Reset
                setTitle("");
                setDescription("");
                setPrice("");
                setCategory("");
                setImage("");
                setType("Sell");
                setRentDuration("");
                setDeposit("");

                // 5. Success Feedback & Redirect
                setTimeout(() => {
                    navigate('/browse');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product listing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-page">
            <div className="create-product-container">
                <div className="create-product-header">
                    <h2 className="create-product-title">List an Item</h2>
                    <p className="create-product-subtitle">Share your gear with the campus community.</p>
                </div>

                {error && <div className="form-message error">{error}</div>}
                {success && <div className="form-message success">{success}</div>}

                <form onSubmit={handleSubmit} className="create-product-form">
                    {/* Basic Info */}
                    <div className="form-group">
                        <label className="form-label">Product Title *</label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder="e.g., Calculus Vol. 2 Textbook"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea 
                            className="form-textarea"
                            placeholder="Tell students more about the item's condition, usage, and why it's a great deal..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Price & Category Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Price ($) *</label>
                            <input 
                                type="number" 
                                className="form-input"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select 
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder="Paste a direct image link (JPEG, PNG)"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />
                    </div>

                    {/* Listing Type */}
                    <div className="form-group">
                        <label className="form-label">Listing Type</label>
                        <select 
                            className="form-select"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Sell">Sell (One-time purchase)</option>
                            <option value="Rent">Rent (Timed borrowing)</option>
                        </select>
                    </div>

                    {/* Rent-specific fields */}
                    {type === 'Rent' && (
                        <div className="rent-details-box fade-in">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Rent Duration</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        placeholder="e.g., 2 weeks"
                                        value={rentDuration}
                                        onChange={(e) => setRentDuration(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Deposit ($)</label>
                                    <input 
                                        type="number" 
                                        className="form-input"
                                        placeholder="0.00"
                                        value={deposit}
                                        onChange={(e) => setDeposit(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn-submit-listing"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner-small"></span>
                                Creating Listing...
                            </>
                        ) : (
                            "Create Product listing →"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;
