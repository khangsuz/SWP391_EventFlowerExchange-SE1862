import React from "react";
import "./index.scss";
import api from "../../config/axios";

function ProductCard({ flower }) {
  const handleAddToCart = async () => {
    try {
      const response = await api.post("cart", {
        productId: flower.id,
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
      <img src="https://i.postimg.cc/90Bs6nLP/top-view-roses-flowers.jpg" alt="" />
      <p className="name">Bong Hoa</p>
      <p className="price">100.000₫</p>
      <center>
      <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
      </center>
    </div>
  );
}

export default ProductCard;