// SWP391_EventFlowerExchange-SE1862/src/component/product-card/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  if (!flower) return null;

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
  }, [navigate]); // Added navigate to dependency array

  const decodeJwt = (token) => {
    const payload = token.split('.')[1]; // Get the payload part of the JWT
    const decodedPayload = JSON.parse(atob(payload)); // Decode the Base64 URL encoded payload
    return decodedPayload;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setLoading(true); // Set loading to true

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate('/login'); // Redirect to login
      setLoading(false); // Reset loading state
      return;
    }

    try {
      const response = await api.post("Orders/addtocart", null, {
        params: {
          flowerId: flower.flowerId,
          quantity: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`, // Add token to header
        },
      });
      console.log(response);
      alert("Thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
      alert(errorMessage);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    localStorage.removeItem("user"); // Remove user info
    navigate('/login'); // Redirect to login
  };
  
  return (
    <div className="product-card" onClick={handleViewDetails}>
      <img src={flower.imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"} alt={flower.flowerName} />
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