import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          setProfile(res.data.data);
        } else {
          setError(res.data.message || 'Error fetching profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-loading">Loading Profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  if (!profile) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        
        <div className="profile-header-section">
          <div className="profile-avatar">
            {getInitials(profile.name)}
          </div>
          <h2 className="profile-name">{profile.name}</h2>
          <div className="profile-email-container">
            <span className="profile-email">{profile.email}</span>
            {profile.isVerified && <span className="profile-verified-badge">Verified ✅</span>}
          </div>
          {profile.isVerified && (
            <div className="profile-student-badge">
              🎓 Verified Student
            </div>
          )}
        </div>

        <div className="profile-details-section">
          <div className="profile-detail-item">
            <span className="profile-detail-label">College Name</span>
            <span className="profile-detail-value">{profile.collegeName || 'N/A'}</span>
          </div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">College ID</span>
            <span className="profile-detail-value">{profile.collegeIdNumber || 'N/A'}</span>
          </div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Role</span>
            <span className="profile-detail-value" style={{ textTransform: 'capitalize' }}>
              {profile.role || 'User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
