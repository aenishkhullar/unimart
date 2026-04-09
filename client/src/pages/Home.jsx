import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Home.css';
// ... existing code ...

/* ─── Category config (updated list) ─── */
const CATEGORIES = [
  { name: 'Books',            value: 'Books',             icon: '📚', color: '#FFF3E0' },
  { name: 'Dorm Essentials',  value: 'Dorm Essentials',   icon: '🛏️', color: '#E8F5E9' },
  { name: 'Electronics',      value: 'Electronics',        icon: '💻', color: '#E3F2FD' },
  { name: 'Stationery',       value: 'Stationery',         icon: '✏️', color: '#F3E5F5' },
  { name: 'Clothing',         value: 'Clothing',           icon: '👕', color: '#FCE4EC' },
  { name: 'Lifestyle',        value: 'Lifestyle',          icon: '🎯', color: '#E0F7FA' },
  { name: 'Transport',        value: 'Transport',          icon: '🚲', color: '#FFF9C4' },
  { name: 'Others',           value: 'Others',             icon: '📦', color: '#F5F5F5' },
];

const CATEGORY_ICON_MAP = {
  'Books':            '📚',
  'Dorm Essentials':  '🛏️',
  'Electronics':      '💻',
  'Stationery':       '✏️',
  'Clothing':         '👕',
  'Lifestyle':        '🎯',
  'Transport':        '🚲',
  'Others':           '📦',
};

function getCategoryIcon(category) {
  return CATEGORY_ICON_MAP[category] || '🛍️';
}

/* ─── Features data ─── */
const FEATURES = [
  {
    icon: '🎓',
    title: 'Built for Students',
    desc: 'Tailored specifically for the campus ecosystem, addressing unique student logistics and budget constraints.',
  },
  {
    icon: '♻️',
    title: "Rent, Don't Just Buy",
    desc: 'Save up to 80% by renting textbooks and seasonal items rather than purchasing them outright.',
  },
  {
    icon: '🔒',
    title: 'Safe Campus Transactions',
    desc: 'Verified campus meet-up points and secure payment processing ensure every exchange is worry-free.',
  },
  {
    icon: '🌱',
    title: 'Sustainable Sharing',
    desc: 'Join the circular economy. Reduce waste by passing on items to the next generation of students.',
  },
];

/* ═══════════════════════════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════════════════════════ */
const Home = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const navigate = useNavigate();

  /* ─── Fetch products ─── */
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data.data || res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p className="loading-text">Loading your marketplace…</p>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <p className="loading-text" style={{ color: '#ba1a1a' }}>⚠ {error}</p>
        </div>
      </div>
    );
  }

  const trendingProducts = products.slice(0, 8);

  return (
    <div className="home-page">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="hero-section">
        <div className="hero-inner">

          {/* — Left copy — */}
          <div className="fade-up">
            <span className="hero-eyebrow">The Curated Campus Exchange</span>
            <h1 className="hero-title">
              Buy, Sell &amp; <em>Rent</em>
              <br />On Campus
            </h1>
            <p className="hero-subtitle">
              Textbooks, gadgets, dorm essentials — discover amazing deals from
              students just like you, right here on campus.
            </p>

            <div className="hero-cta-group">
              <button
                id="hero-browse-btn"
                className="btn-hero-primary"
                onClick={() => {
                  document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Products →
              </button>
              <button
                id="hero-list-btn"
                className="btn-hero-secondary"
                onClick={() => navigate('/create-product')}
              >
                List an Item
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-number">{products.length}+</div>
                <div className="hero-stat-label">Listings</div>
              </div>
              <div>
                <div className="hero-stat-number">80%</div>
                <div className="hero-stat-label">Avg. Savings</div>
              </div>
              <div>
                <div className="hero-stat-number">100%</div>
                <div className="hero-stat-label">Campus-Safe</div>
              </div>
            </div>
          </div>

          {/* — Right visual grid — */}
          <div className="hero-visual">
            {/* "Trending this week" badge now sits ABOVE the card grid */}
            <div className="hero-badge-top">🔥 Trending this week</div>
            <div className="hero-visual-card">
              {[
                { icon: '📚', label: 'Calculus Vol.2',    price: '₹950' },
                { icon: '💻', label: 'MacBook Air M1',    price: '₹60000' },
                { icon: '🎧', label: 'Sony WH-1000XM4',  price: '₹14000' },
                { icon: '🛏️', label: 'Retro Mini Fridge', price: '₹500/day' },
              ].map((item) => (
                <div key={item.label} className="hero-mini-product">
                  <div className="hero-mini-icon">{item.icon}</div>
                  <div className="hero-mini-label">{item.label}</div>
                  <div className="hero-mini-price">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MAIN CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="main-content" id="categories-section">

        {/* ─── Explore Categories ─── */}
        <section className="content-section">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Explore</div>
              <h2 className="section-title">Browse by Category</h2>
            </div>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                id={`cat-btn-${cat.value.replace(/\s+/g, '-')}`}
                className="category-card-btn"
                style={{ '--cat-color': cat.color }}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.value)}`)}
              >
                <div className="category-card-icon">{cat.icon}</div>
                <div className="category-card-name">{cat.name}</div>
                <div className="category-card-arrow">→</div>
              </button>
            ))}
          </div>
        </section>

        {/* ─── Trending section ─── */}
        {trendingProducts.length > 0 && (
          <section className="content-section">
            <div className="section-header">
              <div>
                <div className="section-eyebrow">Hot right now</div>
                <h2 className="section-title">Trending on Campus</h2>
              </div>
              <button
                id="trending-see-all-btn"
                className="btn-see-all"
                onClick={() => navigate('/browse')}
              >
                See all →
              </button>
            </div>

            <div className="trending-scroll">
              {trendingProducts.map((product) => (
                <div key={`trending-${product._id || product.id}`} style={{ flex: '0 0 auto', width: '280px' }}>
                    <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="features-section">
        <div className="features-inner">
          <div className="features-header">
            <div className="section-eyebrow" style={{ textAlign: 'center' }}>Why UniMart</div>
            <h2 className="section-title" style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              Built for student life
            </h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TESTIMONIAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="testimonial-section">
        <div className="testimonial-inner">
          <div className="section-eyebrow" style={{ textAlign: 'center', marginBottom: '2rem' }}>Student Stories</div>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="testimonial-card" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <p className="testimonial-quote" style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '1.5rem', color: '#444' }}>
                "Saved me hundreds on textbooks! UniMart is a game changer for every student on campus."
              </p>
              <div className="testimonial-author" style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#111' }}>
                <span style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '8px' }}>👩🏽‍🎓</span>
                SARAH K., YEAR 3
              </div>
            </div>
            
            <div className="testimonial-card" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <p className="testimonial-quote" style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '1.5rem', color: '#444' }}>
                "Super smooth campus transactions. Better than the messy WhatsApp groups!"
              </p>
              <div className="testimonial-author" style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#111' }}>
                <span style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '8px' }}>👨🏻‍🎓</span>
                JAMES L., YEAR 1
              </div>
            </div>

            <div className="testimonial-card" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <p className="testimonial-quote" style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '1.5rem', color: '#444' }}>
                "Rented a bike for a week. Trusted sellers and easy pickup. Best marketplace for students."
              </p>
              <div className="testimonial-author" style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#111' }}>
                <span style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '8px' }}>👳🏽‍♂️</span>
                ARJUN P., YEAR 2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="cta-banner">
        <div className="cta-banner-inner">
          <div className="cta-banner-text">
            <div className="cta-eyebrow">Have items to share?</div>
            <h2>Turn unused gear into extra cash.</h2>
            <p>List your first item in under 2 minutes. It's completely free.</p>
          </div>
          <button
            id="cta-create-listing-btn"
            className="btn-hero-primary"
            onClick={() => navigate('/create-product')}
          >
            Become a Seller →
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="editorial-footer">
        <div className="editorial-footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand-name">Uni<span>Mart</span></div>
              <p className="footer-brand-desc">
                The curated campus exchange for the next generation of scholars and makers.
              </p>
            </div>
            <div>
              <div className="footer-heading">Quick Links</div>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/browse">Browse</a></li>
                <li><a href="/create-product">List Product</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Categories</div>
              <ul className="footer-links">
                <li><a href="/#">Books</a></li>
                <li><a href="/#">Electronics</a></li>
                <li><a href="/#">Dorm Essentials</a></li>
                <li><a href="/#">Clothing</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Support</div>
              <ul className="footer-links">
                <li><a href="/#">Help Center</a></li>
                <li><a href="/#">Terms of Service</a></li>
                <li><a href="/#">Privacy Policy</a></li>
                <li><a href="/#">Safety Tips</a></li>
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
      </footer>

    </div>
  );
};

export default Home;
