import React, { useState, useEffect, useRef } from 'react';

const CategoryNav = ({ categories, onCategoryClick, onAllClick, currentCategory }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const navRef = useRef(null);

  // Sync activeCategory with currentCategory prop from URL
  useEffect(() => {
    if (currentCategory) {
      setActiveCategory(currentCategory.toLowerCase().replace(/\s+/g, '-'));
    } else {
      setActiveCategory('All');
    }
  }, [currentCategory]);

  // IntersectionObserver to detect which section is in view
  useEffect(() => {
    // Only use IntersectionObserver if we are not filtering by a specific category
    if (currentCategory) return;

    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px', // Adjust margin for the sticky header
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    categories.forEach((cat) => {
      const section = document.getElementById(cat.toLowerCase().replace(/\s+/g, '-'));
      if (section) observer.observe(section);
    });

    // Special case for top of page (All)
    const handleScroll = () => {
      if (window.scrollY < 200 && !currentCategory) {
        setActiveCategory('All');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories, currentCategory]);

  const handleNavClick = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      onAllClick();
    } else {
      onCategoryClick(cat.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  return (
    <nav className="category-nav" ref={navRef}>
      <div className="category-nav-inner scroll-x">
        <button
          key="all"
          className={`nav-category-chip ${activeCategory === 'All' ? 'active' : ''}`}
          onClick={() => handleNavClick('All')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`nav-category-chip ${activeCategory === cat.toLowerCase().replace(/\s+/g, '-') ? 'active' : ''}`}
            onClick={() => handleNavClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
