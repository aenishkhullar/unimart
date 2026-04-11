import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './OrderReceipt.css';

const OrderReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}/receipt`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setReceipt(data.receipt);
        }
      } catch (error) {
        console.error('Error fetching receipt:', error);
        toast.error(error.response?.data?.message || 'Failed to load receipt');
        navigate('/my-orders');
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading-container">Generating Receipt...</div>;
  }

  if (!receipt) {
    return <div className="loading-container">No receipt found.</div>;
  }

  return (
    <div className="receipt-page">
      <div className="receipt-header">
        <div className="brand-section">
          <h1>UniMart</h1>
          <p>Your Trusted Campus Marketplace</p>
        </div>
        <div className="receipt-title">
          <h2>Official Receipt</h2>
          <p>Order #{receipt.orderId.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-group">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> {receipt.buyerName}</p>
          <p><strong>Purchase Date:</strong> {new Date(receipt.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="info-group">
          <h3>Transaction Info</h3>
          <p><strong>Seller:</strong> {receipt.sellerName}</p>
          <p><strong>Status:</strong> <span style={{ textTransform: 'uppercase', color: '#16a34a', fontWeight: 'bold' }}>{receipt.status}</span></p>
        </div>
      </div>

      <table className="order-details-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Type</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="product-info-cell">
              <span className="product-title">{receipt.productTitle}</span>
              <span className="product-cat">{receipt.productCategory}</span>
            </td>
            <td>{receipt.type === 'rent' ? 'Rental' : 'Purchase'}</td>
            <td>₹{receipt.price.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-row">
            <span>Base Price</span>
            <span>₹{receipt.price.toLocaleString()}</span>
          </div>
          
          {receipt.type === 'rent' && (
            <>
              <div className="summary-row">
                <span>Rent Total</span>
                <span>₹{receipt.rentTotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Security Deposit</span>
                <span>₹{receipt.deposit.toLocaleString()}</span>
              </div>
            </>
          )}

          <div className="summary-row total">
            <span>Total Payable</span>
            <span>₹{receipt.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="receipt-footer">
        <p>This is a computer-generated receipt and does not require a physical signature.</p>
        <p>Thank you for using UniMart!</p>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
        <button onClick={handlePrint} className="print-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default OrderReceipt;
