import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./index.scss";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import { getFullImageUrl } from '../../utils/imageHelpers';
import { Notification, notifySuccess, notifyError } from "../../component/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner } from '@fortawesome/free-solid-svg-icons';

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { updateCartItemCount } = useCart();

  const addToCart = (item, quantity) => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = storedCart.find((cartItem) => cartItem.flowerId === item.flowerId);

    if (existingItem) {
      if (existingItem.quantity + quantity > item.quantity) {
        notifyError(`Không thể thêm quá số lượng trong kho!`);
        return;
      }
      const updatedCart = storedCart.map((cartItem) =>
        cartItem.flowerId === item.flowerId
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      notifySuccess(`${item.flowerName} đã được thêm vào giỏ hàng!`);
    } else {
      const updatedCart = [...storedCart, { ...item, quantity: quantity }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      notifySuccess(`${item.flowerName} đã được thêm vào giỏ hàng!`);
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
      notifyError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
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
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  const imageUrl = getFullImageUrl(flower.imageUrl);

  const averageRating = flower.rating && flower.rating.length > 0
    ? (flower.rating.reduce((acc, curr) => acc + curr, 0) / flower.rating.length).toFixed(1)
    : 0;
  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;

  if (!flower) return null;

  return (
    <div className="product-card relative border border-gray-300 p-2 rounded-lg transition-shadow duration-300 ease-in-out hover:shadow-lg">
      <div onClick={handleViewDetails}>
      <img 
        src={imageUrl} 
        alt={flower.flowerName} 
      />
      <p className="name">{flower.flowerName} ({flower.quantity})</p>
      <p className="price">{Number(flower.price).toLocaleString()}₫</p>
      <center>
        <button onClick={handleAddToCart}>
          Thêm vào giỏ hàng
        </button>
      </center>
        <img
          src={imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"}
          alt={flower.flowerName}
          className="w-full h-auto object-cover rounded-md transition-transform duration-300 ease-in-out hover:scale-105"
        />
        <p className="name text-center mt-3 text-lg font-medium">
          {flower.flowerName} ({flower.quantity})
        </p>
        <p className="price text-center text-red-500 font-bold">
          {Number(flower.price).toLocaleString()}₫
        </p>
        <div className="rating justify-center items-center space-x-1 mt-2">
          {[...Array(fullStars)].map((_, index) => (
            <FontAwesomeIcon key={index} icon={faStar} className="text-yellow-400" />
          ))}
          {halfStar === 1 && <FontAwesomeIcon icon={faStar} className="text-yellow-400" />}
          {[...Array(5 - fullStars - halfStar)].map((_, index) => (
            <FontAwesomeIcon key={index + fullStars + halfStar} icon={faStar} className="text-gray-300" />
          ))}
          {averageRating === 0 && <p className="text-gray-500 text-sm mt-1">Chưa có đánh giá</p>}
        </div>
        <div className="text-center pb-4">
          {flower.quantity > 0 ? (
            <button onClick={handleAddToCart} disabled={loading}>
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <p className="">Thêm vào giỏ hàng</p>
              )}
            </button>
          ) : (
            <p className="text-red-500 mt-5">Hết hàng</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
