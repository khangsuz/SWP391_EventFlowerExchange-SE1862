import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import { getFullImageUrl } from '../../utils/imageHelpers';
import { Notification, notifySuccess, notifyError } from "../../component/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
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
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`Reviews/flower/${flower.flowerId}`);
      setAverageRating(response.data.averageRating || 0);
      setReviews(response.data.reviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (flower) {
      fetchReviews();
    }
  }, [flower]);

  const imageUrl = getFullImageUrl(flower.imageUrl);

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  if (!flower) return null;

  return (
    <div className="product-card relative border border-gray-300 p-2 rounded-lg transition-shadow duration-300 ease-in-out hover:shadow-lg">
      <div onClick={handleViewDetails}>
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
          {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} className="text-yellow-400" />}
          {[...Array(emptyStars)].map((_, index) => (
            <FontAwesomeIcon key={index + fullStars + (hasHalfStar ? 1 : 0)} icon={faStar} className="text-gray-200" />
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