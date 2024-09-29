import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login'); // Redirect to login if no token
    } else {
      try {
        const decodedToken = decodeJwt(token);
        const isExpired = decodedToken.exp * 1000 < Date.now(); // Check expiration

        if (isExpired) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate('/login'); // Redirect to login if token is expired
        }
      } catch (error) {
        console.error("Token decoding failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login'); // Redirect to login if token is invalid
      }
    }
  }, [navigate]);

  const decodeJwt = (token) => {
    const payload = token.split('.')[1]; // Get the payload part of the JWT
    const decodedPayload = JSON.parse(atob(payload)); // Decode the Base64 URL encoded payload
    return decodedPayload;
  };

  const addToCart = (item) => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = storedCart.find((cartItem) => cartItem.flowerId === item.flowerId);
    
    if (existingItem) {
      const updatedCart = storedCart.map((cartItem) =>
        cartItem.flowerId === item.flowerId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...storedCart, { ...item, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setLoading(true);

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("Orders/addtocart", null, {
        params: {
          flowerId: flower.flowerId,
          quantity: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      addToCart(flower); // Add to local storage cart
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  };

  if (!flower) return null;

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <img 
        src={flower.imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"} 
        alt={flower.flowerName} 
      />
      <p className="name">{flower.flowerName}</p>
      <p className="price">{flower.price.toLocaleString()}₫</p>
      <center>
        <button onClick={handleAddToCart} disabled={loading}>
          {loading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
      </center>
    </div>
  );
}

export default ProductCard;