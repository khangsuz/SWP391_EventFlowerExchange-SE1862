import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!flower || !flower.flowerId) {
      console.error('Invalid flower object:', flower);
      return;
    }
  
    try {
      const response = await api.post('Orders/addtocart', null, {
        params: {
          flowerId: flower.flowerId,
          quantity: 1
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.message) {
        alert(response.data.message);
        // Update local storage with the new item
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = currentCart.findIndex(item => item.flowerId === flower.flowerId);
        if (existingItemIndex !== -1) {
          currentCart[existingItemIndex].quantity += 1;
        } else {
          currentCart.push({ ...flower, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(currentCart));
      } else {
        alert("Sản phẩm đã được thêm vào giỏ hàng!");
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng: " + (error.response?.data || error.message));
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  if (!flower) return null;

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <img 
        src={flower.imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"} 
        alt={flower.flowerName} 
      />
      <p className="name">{flower.flowerName}</p>
      <p className="price">{Number(flower.price).toLocaleString()}₫</p>
      <center>
        <button onClick={handleAddToCart}>
          Thêm vào giỏ hàng
        </button>
      </center>
    </div>
  );
}

export default ProductCard;