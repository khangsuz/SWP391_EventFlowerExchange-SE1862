import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Current User:", user);
    if (user && user.userId) {
      setCurrentUser(user);
    }
  }, []);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const userId = currentUser ? currentUser.userId : null;
    console.log("User ID:", userId);
    if (!userId) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return; // Dừng hàm nếu userId không hợp lệ
    }
    try {
      const response = await api.post("cart", {
        productId: flower.flowerId,
        quantity: 1,
        userId: userId,
      });
      console.log(response);
      alert("Thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.log(err);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <img src={flower.imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"} alt={flower.flowerName} />
      <p className="name">{flower.flowerName}</p>
      <p className="price">{flower.price.toLocaleString()}₫</p>
      <center>
        <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
      </center>
    </div>
  );
}

export default ProductCard;