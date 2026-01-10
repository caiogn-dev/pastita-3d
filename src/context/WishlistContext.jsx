import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/wishlist/');
      if (isMountedRef.current) {
        setWishlist(response.data.products || []);
      }
    } catch {
      // Silently fail - wishlist will be empty
      if (isMountedRef.current) {
        setWishlist([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchWishlist();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchWishlist]);

  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Login required' };
    }

    try {
      const response = await api.post('/wishlist/toggle/', { product_id: productId });
      
      if (response.data.added) {
        // Add to local state
        setWishlist(prev => {
          const exists = prev.some(p => p.id === productId);
          if (!exists) {
            return [...prev, { id: productId }];
          }
          return prev;
        });
      } else {
        // Remove from local state
        setWishlist(prev => prev.filter(p => p.id !== productId));
      }
      
      return { success: true, added: response.data.added };
    } catch (error) {
      // Return error to caller for handling
      return { success: false, error: error.message };
    }
  };

  const isFavorited = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      toggleFavorite,
      isFavorited,
      wishlistCount,
      refreshWishlist: fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
