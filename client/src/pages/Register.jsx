import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        acceptedTerms: false
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const res = await axios.post('http://localhost:5000/api/users/register', formData, config);
            
            if (res.data) {
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Register</h2>
            {message && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '3px' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '3px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Name: </label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                </div>
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
                        minLength="6"
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="checkbox" 
                        name="acceptedTerms" 
                        checked={formData.acceptedTerms} 
                        onChange={handleChange} 
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <label style={{ color: '#555', fontSize: '14px' }}>
                        I agree to the <span onClick={() => setIsPolicyOpen(true)} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy and Terms of Service</span>
                    </label>
                </div>
                <button 
                    type="submit" 
                    disabled={!formData.acceptedTerms}
                    style={{ 
                        padding: '12px', 
                        backgroundColor: formData.acceptedTerms ? '#007bff' : '#ccc', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px', 
                        cursor: formData.acceptedTerms ? 'pointer' : 'not-allowed', 
                        fontSize: '16px', 
                        marginTop: '10px',
                        transition: 'background-color 0.3s'
                    }}
                >
                    Register
                </button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here</Link>
            </p>
            <PrivacyPolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
        </div>
    );
};

export default Register;
