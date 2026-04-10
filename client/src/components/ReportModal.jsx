import React, { useState } from 'react';
import axios from 'axios';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for the report.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/reports', {
        targetType,
        targetId,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Report submitted successfully. Thank you for helping us keep UniMart safe!' });
      setReason('');
      
      // Close after delay
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to submit report. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-container">
        <div className="report-modal-header">
          <h3>Report {targetType === 'user' ? 'User' : 'Product'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="report-modal-body">
          <p className="report-context">
            Reporting: <strong>{targetName || targetId}</strong>
          </p>
          
          {message.text && (
            <div className={`report-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Reason for reporting</label>
              <textarea
                id="reason"
                className="report-textarea"
                placeholder={`Describe why you are reporting this ${targetType}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading || message.type === 'success'}
              ></textarea>
            </div>
            
            <div className="report-modal-footer">
              <button 
                type="button" 
                className="btn-cancel-report" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit-report"
                disabled={loading || message.type === 'success'}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
