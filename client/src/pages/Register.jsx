import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const Register = () => {
    const [step, setStep] = useState('register'); // 'register' | 'otp'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        collegeName: '',
        collegeIdNumber: '',
        acceptedTerms: false
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);
    const navigate = useNavigate();
    const otpRefs = useRef([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Inject styles
    useEffect(() => {
        const styleId = 'register-split-styles';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
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
                    max-width: 440px;
                }

                @media (max-width: 900px) {
                    .split-container {
                        flex-direction: column;
                    }
                    .split-left {
                        padding: 60px 20px;
                        min-height: 25vh;
                        text-align: center;
                    }
                    .split-right {
                        padding: 40px 20px;
                        min-height: 75vh;
                        justify-content: flex-start;
                    }
                }

                .custom-input {
                    width: 100%;
                    padding: 12px 16px;
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
                    border-radius: 9999px;
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

                .otp-input {
                    width: 52px;
                    height: 60px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .otp-input:focus {
                    border-color: #0f172a;
                    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
                    background: #ffffff;
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    margin-bottom: 24px;
                    border: 1px solid transparent;
                }
                
                .alert-error {
                    background: #fef2f2;
                    color: #dc2626;
                    border-color: #fee2e2;
                }
                
                .alert-success {
                    background: #f0fdf4;
                    color: #166534;
                    border-color: #dcfce7;
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
            `;
            document.head.appendChild(styleEl);
        }
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/users/register', formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.data?.success) {
                setMessage('');
                setStep('otp');
                setResendCooldown(60);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/users/verify-otp', {
                email: formData.email,
                otp: otpString
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.data?.success) {
                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/users/resend-otp', {
                email: formData.email
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.data?.success) {
                setMessage('A new OTP has been sent to your email.');
                setOtp(['', '', '', '', '', '']);
                setResendCooldown(60);
                otpRefs.current[0]?.focus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = formData.acceptedTerms && formData.name && formData.email && formData.password && formData.collegeName && formData.collegeIdNumber && !loading;

    return (
        <div className="split-container">
            {/* LEFT SECTION (HERO) */}
            <div className="split-left">
                <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ 
                        display: 'inline-block', 
                        background: '#0f172a', 
                        color: 'white', 
                        padding: '6px 16px', 
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '24px',
                        letterSpacing: '0.5px'
                    }}>
                        UniMart
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: '1.2' }}>
                        Join the Campus Exchange.
                    </h1>
                </div>
            </div>

            {/* RIGHT SECTION (FORM) */}
            <div className="split-right">
                <div className="form-wrapper">
                    {step === 'register' ? (
                        <>
                            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 32px' }}>
                                Create your profile
                            </h2>

                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-error">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="custom-input" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@college.edu" required className="custom-input" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required minLength="6" className="custom-input" />
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>College Name</label>
                                        <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="Stanford..." required className="custom-input" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>College ID</label>
                                        <input type="text" name="collegeIdNumber" value={formData.collegeIdNumber} onChange={handleChange} placeholder="E.g. CE1234" required className="custom-input" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '32px' }}>
                                    <input 
                                        type="checkbox" 
                                        name="acceptedTerms" 
                                        checked={formData.acceptedTerms} 
                                        onChange={handleChange} 
                                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#0f172a', cursor: 'pointer', flexShrink: 0 }}
                                        id="terms-check"
                                    />
                                    <label htmlFor="terms-check" style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', cursor: 'pointer' }}>
                                        I agree to the{' '}
                                        <span onClick={(e) => { e.preventDefault(); setIsPolicyOpen(true); }} style={{ color: '#0f172a', fontWeight: '600', textDecoration: 'underline' }}>
                                            Privacy Policy & Terms of Service
                                        </span>
                                    </label>
                                </div>

                                <button type="submit" disabled={!canSubmit} className="custom-btn">
                                    {loading ? (
                                        <><div className="spinner"></div> Creating Account...</>
                                    ) : (
                                        <>Create Account <span style={{ marginLeft: '4px' }}>→</span></>
                                    )}
                                </button>
                            </form>

                            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#0f172a', fontWeight: '600', textDecoration: 'none' }}>
                                    Sign in
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '16px', 
                                background: '#f8fafc', border: '1px solid #e2e8f0', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 24px', color: '#0f172a'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>

                            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px' }}>
                                Verify your email
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '8px' }}>
                                We've sent a 6-digit code to
                            </p>
                            <div style={{ 
                                display: 'inline-block', padding: '6px 16px', background: '#f1f5f9', 
                                border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '14px', 
                                fontWeight: '500', color: '#334155', marginBottom: '32px'
                            }}>
                                {formData.email}
                            </div>

                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-error">{error}</div>}

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }} onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        ref={(el) => (otpRefs.current[i] = el)}
                                        className="otp-input"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={handleVerifyOtp} 
                                disabled={loading || otp.join('').length !== 6} 
                                className="custom-btn"
                                style={{ marginBottom: '24px' }}
                            >
                                {loading ? <><div className="spinner"></div>Verifying...</> : 'Verify Email'}
                            </button>

                            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px' }}>
                                Didn't receive the code?{' '}
                                <button 
                                    onClick={handleResendOtp} 
                                    disabled={resendCooldown > 0 || loading}
                                    style={{ 
                                        background: 'none', border: 'none', color: resendCooldown > 0 ? '#cbd5e1' : '#0f172a', 
                                        fontWeight: '600', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', 
                                        padding: 0, textDecoration: resendCooldown > 0 ? 'none' : 'underline'
                                    }}
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                </button>
                            </p>

                            <button 
                                onClick={() => { setStep('register'); setError(''); setMessage(''); setOtp(['', '', '', '', '', '']); }}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                ← Back to registration
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <PrivacyPolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
        </div>
    );
};

export default Register;
