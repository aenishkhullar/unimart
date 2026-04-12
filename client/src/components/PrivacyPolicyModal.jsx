import React from 'react';
import Modal from './Modal';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
      <div className="privacy-policy-content">
        <p><strong>Effective Date: April 10, 2026</strong></p>
        
        <p>Welcome to UniMart. We are committed to protecting the privacy of our student community. This policy explains how we collect, use, and safeguard your information when you buy, sell, or rent products on our platform.</p>

        <h3>1. Information We Collect</h3>
        <p>To maintain a trusted environment, we collect the following data:</p>
        <ul>
            <li><strong>Account Information:</strong> Name, personal email address, and mobile phone number.</li>
            <li><strong>Verification Data:</strong> Email and SMS-based OTP (One-Time Password) status to ensure the validity of the account.</li>
            <li><strong>Transport Verification:</strong> For vehicle rentals, we collect the Driving License (DL) Number of the buyer. We do not store images of your physical license.</li>
            <li><strong>Transaction Data:</strong> Details of items listed, chat history between buyers and sellers, and order status.</li>
        </ul>

        <h3>2. How We Use Your Data</h3>
        <p>We use your information strictly for the following purposes:</p>
        <ul>
            <li><strong>Identity Verification:</strong> To prevent bot accounts and ensure every user is a reachable individual.</li>
            <li><strong>Facilitating Handovers:</strong> To allow sellers to verify the identity of a buyer before handing over high-value items like vehicles.</li>
            <li><strong>Safety & Accountability:</strong> To provide a trail of accountability in the event of a dispute or illegal activity involving a rented vehicle.</li>
        </ul>

        <h3>3. Data Security & The "DL Clause"</h3>
        <p>We treat your Driving License number as Sensitive Personal Data.</p>
        <ul>
            <li><strong>Encryption:</strong> All DL numbers are encrypted at rest using industry-standard protocols (e.g., AES-256).</li>
            <li><strong>Restricted Access:</strong> Your full DL number is only visible to the specific seller you are renting from, and only for the duration of that specific transaction.</li>
            <li><strong>No Image Storage:</strong> To minimize risk, UniMart does not request or store digital copies/photos of your government IDs.</li>
        </ul>

        <h3>4. Data Retention & The "Purge" Rule</h3>
        <p>We do not believe in keeping your sensitive data forever.</p>
        <ul>
            <li><strong>Active Transactions:</strong> DL numbers are retained in our active database only while a rental is "In Progress."</li>
            <li><strong>Auto-Deletion:</strong> Within 24 hours of a transaction being marked as "Complete," the DL number is permanently purged from our primary database.</li>
            <li><strong>Account Deletion:</strong> If you delete your UniMart account, all associated contact info and transaction history are wiped within 30 days.</li>
        </ul>

        <h3>5. Third-Party Disclosure</h3>
        <ul>
            <li><strong>No Selling of Data:</strong> UniMart will never sell your personal information to third-party advertisers or data brokers.</li>
            <li><strong>Legal Compliance:</strong> We may disclose information only if required by law or university administration in cases of reported theft, accidents, or illegal activities.</li>
        </ul>

        <h3>6. User Responsibilities</h3>
        <p>As a peer-to-peer platform, safety is a shared responsibility:</p>
        <ul>
            <li><strong>Accuracy:</strong> Users must provide a valid, current DL number. Providing a fake number is a violation of our Terms of Service.</li>
            <li><strong>Physical Verification:</strong> Sellers are required to physically inspect the buyer's original license to ensure it matches the name and number provided in the app.</li>
        </ul>
      </div>
    </Modal>
  );
};

export default PrivacyPolicyModal;
