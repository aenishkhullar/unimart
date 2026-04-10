import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateProduct.css';

const CATEGORIES = [
  "Books",
  "Electronics",
  "Clothing",
  "Lifestyle",
  "Dorm Essentials",
  "Stationery",
  "Others",
  "Transport"
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
    const [deposit, setDeposit] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append("image", file);

        setUploading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImage(res.data.url);
        } catch (err) {
            setError('Image upload failed');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Validation
        if (!title.trim() || !price || !category || !quantity) {
            setError(`Please fill all required fields (Title, ${type === 'Sell' ? 'Selling Price' : 'Rent Price'}, Category, Quantity)`);
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
                category,
                type: finalType,
                image: image || undefined,
                quantity: Number(quantity)
            };

            if (finalType === 'rent') {
                payload.rentPrice = priceNumber;
                payload.deposit = Number(deposit);
            } else {
                payload.price = priceNumber;
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
                setDeposit("");
                setQuantity(1);
                setPreviewUrl("");

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
                            <label className="form-label">{type === 'Sell' ? 'Selling Price (₹)' : 'Rent Price (₹ per day)'} *</label>
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
                                onChange={(e) => {
                                    const newCategory = e.target.value;
                                    setCategory(newCategory);
                                    if (newCategory === 'Transport') {
                                        setType('Rent');
                                    }
                                }}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quantity *</label>
                        <input 
                            type="number" 
                            className="form-input"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Product Image</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="form-input"
                            onChange={handleImageUpload}
                            disabled={uploading || loading}
                        />
                        {uploading && <div className="form-message" style={{color: '#666', marginTop: '5px'}}>Uploading image...</div>}
                        {previewUrl && (
                            <div className="image-preview-container" style={{ marginTop: '10px' }}>
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                        )}
                    </div>

                    {/* Listing Type */}
                    <div className="form-group">
                        <label className="form-label">Listing Type</label>
                        <select 
                            className="form-select"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={category === 'Transport'}
                        >
                            {category === 'Transport' ? (
                                <option value="Rent">Rent (Timed borrowing)</option>
                            ) : (
                                <>
                                    <option value="Sell">Sell (One-time purchase)</option>
                                    <option value="Rent">Rent (Timed borrowing)</option>
                                </>
                            )}
                        </select>
                        {category === 'Transport' && (
                            <div style={{background: '#fff3cd', color: '#856404', padding: '8px 12px', borderRadius: '6px', marginTop: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <span>⚠️</span> Transport items can only be listed for rent.
                            </div>
                        )}
                    </div>

                    {/* Rent-specific fields */}
                    {type === 'Rent' && (
                        <div className="rent-details-box fade-in">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Deposit (₹)</label>
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
                        disabled={loading || uploading}
                    >
                        {loading || uploading ? (
                            <>
                                <span className="loading-spinner-small"></span>
                                {uploading ? "Wait for upload..." : "Creating Listing..."}
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
