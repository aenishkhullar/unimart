import React, { useState } from 'react';
import './HelpCenter.css';

const FAQ_DATA = [
  {
    question: "How to buy or rent items?",
    answer: "Browse the marketplace, select an item, and click 'Rent Now' or 'Buy Now'. You'll be connected with the student seller via our secure chat to finalize the campus meet-up."
  },
  {
    question: "How does the rental system work?",
    answer: "Rentals are time-bound. You pay the rental fee and a refundable deposit. Once you return the item and the seller confirms its condition, your deposit is automatically refunded."
  },
  {
    question: "What is a refundable deposit?",
    answer: "A deposit is a security amount held by UniMart to protect sellers from damages or late returns. It is fully refunded once the rental is successfully completed."
  },
  {
    question: "How to report a user?",
    answer: "If you encounter suspicious behavior or a violation of our terms, click the 'Report' button on the user's profile or product page. Our campus moderators review all reports within 24 hours."
  },
  {
    question: "What if the item is damaged?",
    answer: "If an item is damaged during a rental, the deposit may be partially or fully withheld based on the repair cost. We recommend taking photos of the item before and after the rental."
  }
];

const HelpCenter = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="help-center-page fade-up">

      <main className="container help-content">
        {/* ── Contact / Still Need Help ── */}
        <section className="contact-section">
          <div className="contact-card">
            <div className="contact-icon">✉️</div>
            <h2 className="contact-title">Still need help?</h2>
            <p className="contact-desc">For any issues, account queries, or dispute resolutions, contact our community support team.</p>
            <a
              href="mailto:unimart.community@gmail.com?subject=UniMart Support Request"
              className="contact-email"
            >
              unimart.community@gmail.com
            </a>
            <p className="contact-footer">We typically respond within 12-24 hours.</p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQ_DATA.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => toggleAccordion(index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <span className="faq-toggle-icon">{activeIndex === index ? '−' : '+'}</span>
                </div>
                {activeIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Safety Tips ── */}
        <section id="safety" className="safety-section">
          <h2 className="section-title">Campus Safety Tips</h2>
          <div className="safety-grid">
            <div className="safety-card">
              <div className="safety-num">01</div>
              <h3>Public Meetups</h3>
              <p>Always meet in well-lit, public campus areas like libraries or food courts.</p>
            </div>
            <div className="safety-card">
              <div className="safety-num">02</div>
              <h3>Inspect Items</h3>
              <p>Thoroughly check items before making payments or handing over gear.</p>
            </div>
            <div className="safety-card">
              <div className="safety-num">03</div>
              <h3>Stay on Platform</h3>
              <p>Keep all communication within UniMart to ensure a trail of accountability.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HelpCenter;
