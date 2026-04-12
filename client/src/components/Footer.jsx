import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import './Footer.css';

const Footer = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="editorial-footer">
      <div className="editorial-footer-inner">
        <div className="footer-top">
          <div className="footer-brand-column">
            <div className="footer-brand-name">Uni<span>Mart</span></div>
            <p className="footer-brand-desc">
              The curated campus exchange for the next generation of scholars and makers.
            </p>
          </div>
          
          <div className="footer-links-column">
            <div className="footer-heading">Quick Links</div>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse</Link></li>
              <li><Link to="/create-product">List Product</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <div className="footer-heading">Categories</div>
            <ul className="footer-links">
              <li><Link to="/browse?category=Books">Books</Link></li>
              <li><Link to="/browse?category=Electronics">Electronics</Link></li>
              <li><Link to="/browse?category=Transport">Transport</Link></li>
              <li><Link to="/browse?category=Dorm%20Essentials">Dorm Essentials</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <div className="footer-heading">Support</div>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><button className="footer-link-btn" onClick={() => setIsTermsOpen(true)}>Terms of Service</button></li>
              <li><button className="footer-link-btn" onClick={() => setIsPrivacyOpen(true)}>Privacy Policy</button></li>
              <li><Link to="/help#safety">Safety Tips</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} UniMart. All rights reserved.
          </p>
          <p className="footer-copyright">Made with ♥ for campus life</p>
        </div>
      </div>

      <PrivacyPolicyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />
      <TermsOfServiceModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />
    </footer>
  );
};

export default Footer;
