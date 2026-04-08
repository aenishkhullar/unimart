import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './SellerProfile.css';

const SellerProfile = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${id}/profile`);
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch seller profile.');
                setLoading(false);
            }
        };
        fetchSellerData();
    }, [id]);

    if (loading) {
        return (
            <div className="seller-profile-page loading-state">
                <div className="loader"></div>
                <p>Curating seller data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="seller-profile-page error-state">
                <h2>Profile Not Found</h2>
                <p>{error || "The seller you're looking for doesn't exist."}</p>
                <Link to="/browse" className="btn-editorial">Back to Browse</Link>
            </div>
        );
    }

    const { seller, products, reviews, avgRating, totalReviews, badge } = data;

    return (
        <div className="seller-profile-page">
            <header className="seller-header">
                <div className="container">
                    <div className="seller-identity">
                        <div className="seller-avatar">
                            {(seller.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="seller-meta">
                            <h1 className="seller-name">{seller.name}</h1>
                            {badge && (
                                <span className="seller-badge">{badge}</span>
                            )}
                            <p className="member-since">
                                Member since {new Date(seller.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                            <div className="seller-rating-pill">
                                <span>⭐ {avgRating ? avgRating.toFixed(1) : '0.0'}</span>
                                <span className="rating-count">({totalReviews} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div className="seller-stats">
                        <div className="stat-item">
                            <span className="stat-value">{products.length}</span>
                            <span className="stat-label">Listings</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">100%</span>
                            <span className="stat-label">Response</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="seller-about">
                <div className="container">
                    <h2 className="section-title">About the Seller</h2>
                    <p className="about-text">
                        Campus seller providing quality items. Specializes in textbooks, electronics, and dorm essentials. 
                        Committed to fair pricing and easy campus pickups.
                    </p>
                </div>
            </section>

            <section className="seller-products">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Products by this Seller</h2>
                        <span className="listing-count">{products.length} Items</span>
                    </div>
                    {products.length === 0 ? (
                        <p className="empty-msg">No active listings currently.</p>
                    ) : (
                        <div className="product-grid">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="seller-reviews">
                <div className="container">
                    <h2 className="section-title">What Buyers Say</h2>
                    {reviews.length === 0 ? (
                        <div className="empty-reviews">
                            <p>No reviews yet. Be the first to buy and leave feedback!</p>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review._id} className="review-card-editorial">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <span className="reviewer-name">{review.user?.name || 'Anonymous User'}</span>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="review-rating">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SellerProfile;
