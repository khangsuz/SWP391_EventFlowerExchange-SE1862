import { useEffect, useState } from 'react';
import api from '../../config/axios';
import { message } from 'antd';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('Cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Cart Response:', response.data); // Debug log

      if (response.data) {
        setCartItems(response.data.cartItems || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  
  // Add listener for cart updates
  const handleCartUpdate = () => {
    console.log('Cart update detected');
    fetchCart();
  };
  
  window.addEventListener('cartUpdated', handleCartUpdate);
  
  // Cleanup
  return () => {
    window.removeEventListener('cartUpdated', handleCartUpdate);
  };
}, []);

  // Rest of the component code...
};