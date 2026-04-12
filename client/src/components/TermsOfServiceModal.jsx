import React from 'react';
import Modal from './Modal';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
      <div className="tos-content">
        <p><strong>Effective Date: April 12, 2026</strong></p>
        <p>Welcome to UniMart. By using our platform, you agree to the following terms and conditions. Please read them carefully.</p>

        <h3>1. User Responsibility</h3>
        <ul>
          <li><strong>Eligibility:</strong> You must be a verified student or faculty member of the participating campus to use this platform.</li>
          <li><strong>Accuracy:</strong> Users are responsible for the accuracy of their listings, including item condition, pricing, and availability.</li>
          <li><strong>Verification:</strong> Providing false identification or using non-campus email addresses for registration is a violation of these terms.</li>
        </ul>

        <h3>2. Rental Liability</h3>
        <ul>
          <li><strong>Damage and Loss:</strong> If an item is damaged or lost during a rental period, the renter is liable for repair costs or the current market value of the item, as determined by the platform's guidelines.</li>
          <li><strong>Late Returns:</strong> Renters must return items by the agreed-upon deadline. Late returns may incur a daily penalty fee of ₹50 - ₹500 depending on the item category.</li>
          <li><strong>Deposits:</strong> Refundable deposits are held by the platform and will be returned only after the seller confirms receipt of the item in its original condition.</li>
        </ul>

        <h3>3. Platform Disclaimer</h3>
        <ul>
          <li><strong>"As-Is" Service:</strong> UniMart provides a marketplace platform "as-is" without any warranties, express or implied. We do not guarantee the condition or quality of items listed by third-party sellers.</li>
          <li><strong>No Guarantee:</strong> We are not responsible for any disputes, accidents, or illegal activities arising from transactions between users.</li>
        </ul>

        <h3>4. No Negotiation Policy</h3>
        <ul>
          <li><strong>Price Finality:</strong> All prices listed on the platform and confirmed at the time of booking are final. No further negotiation is allowed at the time of pickup or return.</li>
          <li><strong>Fee Structure:</strong> Transaction fees and service charges are non-refundable.</li>
        </ul>

        <h3>5. Jurisdiction</h3>
        <ul>
          <li><strong>Governing Law:</strong> These terms are governed by and construed in accordance with the laws of India.</li>
          <li><strong>Legal Venue:</strong> Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts in Punjab, India.</li>
        </ul>

        <h3>6. Changes to Terms</h3>
        <p>UniMart reserves the right to modify these terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the new terms.</p>
      </div>
    </Modal>
  );
};

export default TermsOfServiceModal;
