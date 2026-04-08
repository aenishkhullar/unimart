import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchWishlist = async () => {
    if (!token) {
       setWishlist([]);
       return;
    }
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data.data.map(item => item._id || item));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const toggleWishlist = async (productId) => {
    if (!token) {
      // Redirect or show login prompt in a real app, 
      // but for now we'll just return
      return false;
    }

    // Optimistic UI update
    const isWishlisted = wishlist.includes(productId);
    if (isWishlisted) {
      setWishlist(prev => prev.filter(id => id !== productId));
    } else {
      setWishlist(prev => [...prev, productId]);
    }

    try {
      await axios.post(`http://localhost:5000/api/users/wishlist/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // Rollback on error
      if (isWishlisted) {
        setWishlist(prev => [...prev, productId]);
      } else {
        setWishlist(prev => prev.filter(id => id !== productId));
      }
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
