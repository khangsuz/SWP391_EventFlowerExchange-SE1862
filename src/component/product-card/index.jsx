import React from "react";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const handleAddToCart = async () => {
    try {
      const response = await api.post("cart", {
        productId: flower.flowerId,
        quantity: 1,
      });

      console.log(response);
    } catch (err) {
      console.log(err);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  return (
    <div className="product-card">
      {/* <img src={flower.imageUrl || "https://i.postimg.cc/90Bs6nLP/top-view-roses-flowers.jpg"} alt={flower.flowerName} /> */}
      <img src="https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png" alt="" />
      {/* <p className="name">{flower.flowerName}</p> */}
      <p className="name">Bong hoa</p>
      {/* <p className="price">{flower.price.toLocaleString()}₫</p> */}
      <p className="price">1.000.000₫</p>
      <center>
        <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
      </center>
    </div>
  );
}

export default ProductCard;