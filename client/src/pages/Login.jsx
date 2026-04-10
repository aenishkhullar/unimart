import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const res = await axios.post('http://localhost:5000/api/users/login', formData, config);
            
            if (res.data) {
                // Store token in local storage
                localStorage.setItem('token', res.data.token);
                // Optionally store user info as well
                if(res.data && res.data.data && Object.keys(res.data.data).length > 0) {
                   localStorage.setItem('user', JSON.stringify(res.data.data));
                }
                
                // Redirect to dashboard or home page
                navigate('/');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setToastMessage(err.response?.data?.message || 'Your account is blocked.');
                setTimeout(() => setToastMessage(''), 5000);
            } else {
                setError(err.response?.data?.message || 'Invalid email or password.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', fontFamily: 'sans-serif' }}>
            {toastMessage && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#dc3545', color: 'white', padding: '15px 20px', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                    {toastMessage}
                </div>
            )}
            <h2 style={{ textAlign: 'center', color: '#333' }}>Login</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '3px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Email: </label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Password: </label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                Don't have an account? <Link to="/register" style={{ color: '#28a745', textDecoration: 'none' }}>Register here</Link>
            </p>
        </div>
    );
};

export default Login;
