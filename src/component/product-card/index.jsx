import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); // Khởi tạo currentUser

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Current User:", user); // Log thông tin người dùng
    if (user && user.userId) {
        setCurrentUser(user);
    }
}, []);

const handleAddToCart = async (event) => {
  event.stopPropagation();
  const userId = currentUser ? currentUser.userId : null; // Lấy userId từ currentUser

  console.log("User ID:", userId); // Log the userId

  // Kiểm tra xem userId có hợp lệ không
  if (!userId) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return; // Dừng hàm nếu userId không hợp lệ
  }

  try {
      const response = await api.post("Orders/addtocart", {
          flowerId: flower.flowerId,
          quantity: 1,
          userId: userId, // Sử dụng userId
      });

      console.log(response);
      alert("Thêm vào giỏ hàng thành công!");
  } catch (err) {
      console.error("Error adding to cart:", err.response ? err.response.data : err);
      alert("Thêm vào giỏ hàng thất bại!");
  }
  };

  const handleViewDetails = () => {
    navigate(`/product/${flower.flowerId}`);
  };

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <img src={flower.imageUrl || "https://i.postimg.cc/90Bs6nLP/top-view-roses-flowers.jpg"} alt={flower.flowerName} />
      <p className="name">{flower.flowerName}</p>
      <p className="price">{flower.price.toLocaleString()}₫</p>
      <center>
        <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
      </center>
    </div>
  );
}

export default ProductCard;