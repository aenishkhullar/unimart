import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Inject styles including media queries
    useEffect(() => {
        const styleId = 'login-split-styles';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * {
                    box-sizing: border-box;
                }

                .split-container {
                    display: flex;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    flex-direction: row;
                }

                .split-left {
                    flex: 1;
                    background: linear-gradient(135deg, #f6f8fd 0%, #f1f5f9 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }

                .split-right {
                    flex: 1;
                    background-color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }

                .form-wrapper {
                    width: 100%;
                    max-width: 400px;
                }

                @media (max-width: 768px) {
                    .split-container {
                        flex-direction: column;
                    }
                    .split-left {
                        padding: 60px 20px;
                        min-height: 30vh;
                        text-align: center;
                    }
                    .split-right {
                        padding: 40px 20px;
                        min-height: 70vh;
                        justify-content: flex-start;
                        padding-top: 60px;
                    }
                }

                .custom-input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 15px;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    color: #1e293b;
                    background-color: #f8fafc;
                }

                .custom-input:focus {
                    border-color: #0f172a;
                    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
                    background-color: #ffffff;
                }

                .custom-btn {
                    width: 100%;
                    padding: 14px;
                    background-color: #0f172a;
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px; /* pill shape */
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .custom-btn:hover:not(:disabled) {
                    background-color: #1e293b;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
                }

                .custom-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(styleEl);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const res = await axios.post('http://localhost:5000/api/users/login', formData, config);
            
            if (res.data) {
                localStorage.setItem('token', res.data.token);
                if(res.data && res.data.data && Object.keys(res.data.data).length > 0) {
                   localStorage.setItem('user', JSON.stringify(res.data.data));
                }
                navigate('/');
            }
        } catch (err) {
            if (err.response?.data?.emailNotVerified) {
                setToastMessage(err.response.data.message);
                setTimeout(() => setToastMessage(''), 8000);
            } else if (err.response?.status === 403) {
                setToastMessage(err.response?.data?.message || 'Your account is blocked.');
                setTimeout(() => setToastMessage(''), 5000);
            } else {
                setError(err.response?.data?.message || 'Invalid email or password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-container">
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    maxWidth: '400px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    animation: 'slideIn 0.3s ease-out',
                    background: toastMessage.includes('verify') || toastMessage.includes('Verify') ? '#fffbeb' : '#fef2f2',
                    color: toastMessage.includes('verify') || toastMessage.includes('Verify') ? '#92400e' : '#991b1b',
                    border: `1px solid ${toastMessage.includes('verify') || toastMessage.includes('Verify') ? '#fcd34d' : '#fecaca'}`
                }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>
                        {toastMessage.includes('verify') || toastMessage.includes('Verify') ? '⚠' : '✕'}
                    </span>
                    <div>
                        <div>{toastMessage}</div>
                        {(toastMessage.includes('verify') || toastMessage.includes('Verify')) && (
                            <Link
                                to="/register"
                                style={{
                                    color: 'inherit',
                                    fontWeight: '600',
                                    textDecoration: 'underline',
                                    fontSize: '13px',
                                    marginTop: '4px',
                                    display: 'inline-block',
                                }}
                            >
                                Go to Register →
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Left Section (Hero) */}
            <div className="split-left">
                <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px', letterSpacing: '-1px' }}>
                        Welcome Back.
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                        Sign in to browse curated campus essentials.
                    </p>
                </div>
            </div>

            {/* Right Section (Form) */}
            <div className="split-right">
                <div className="form-wrapper">
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 32px' }}>
                        Sign in
                    </h2>

                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            marginBottom: '24px',
                            border: '1px solid #fee2e2'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@college.edu"
                                required
                                className="custom-input"
                            />
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="custom-input"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="custom-btn">
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Login <span style={{ marginLeft: '4px' }}>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#0f172a', fontWeight: '600', textDecoration: 'none' }}>
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
