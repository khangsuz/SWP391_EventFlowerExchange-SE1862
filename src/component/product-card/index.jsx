import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { updateCartItemCount } = useCart();

  const addToCart = (item, quantity) => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = storedCart.find((cartItem) => cartItem.flowerId === item.flowerId);
    
    if (existingItem) {
      const updatedCart = storedCart.map((cartItem) =>
        cartItem.flowerId === item.flowerId
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...storedCart, { ...item, quantity: quantity }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const quantity = 1;

    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm!");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("Orders/addtocart", null, {
        params: {
          flowerId: flower.flowerId,
          quantity: quantity,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      addToCart(flower, quantity);
      updateCartItemCount();
      console.log(response);
      alert("Thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  if (!flower) return null;

  return (
    <div className="product-card">
      <div onClick={handleViewDetails}>
      <img 
        src={flower.imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"} 
        alt={flower.flowerName} 
      />
      <p className="name">{flower.flowerName}</p>
      <p className="price">{flower.price.toLocaleString()}₫</p>
      <center>
        <button onClick={handleAddToCart} disabled={loading}>
        Thêm vào giỏ hàng
        </button>
      </center>
      </div>
    </div>
  );
}

export default ProductCard;
