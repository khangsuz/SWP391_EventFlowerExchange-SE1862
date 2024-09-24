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
      <img src={flower.image} alt="" />
      <p className="name">{flower.name}</p>
      <p className="price">{flower.price}</p>
      <center>
      <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
      </center>
    </div>
  );
}

export default ProductCard;