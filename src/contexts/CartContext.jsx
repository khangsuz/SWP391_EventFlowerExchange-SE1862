import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCartItemCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems(0);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('Cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.items) {
        // Tính tổng số lượng từ tất cả các items
        const totalItems = response.data.items.reduce(
          (sum, item) => sum + item.quantity, 
          0
        );
        setCartItems(totalItems);
      } else {
        setCartItems(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItems(0);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemCount = async () => {
    await fetchCartItemCount();
  };

  // Fetch initial cart count when component mounts
  useEffect(() => {
    fetchCartItemCount();
  }, []);

  // Fetch cart count when user logs in/out
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems(0);
    } else {
      fetchCartItemCount();
    }
  }, [localStorage.getItem('token')]); // Re-run when token changes

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        updateCartItemCount,
        loading 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
