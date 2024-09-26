// src/page/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../config/axios";

const ProductDetail = () => {
  const { id } = useParams(); // Get the flower ID from the URL
  const [flower, setFlower] = useState(null); // State to hold flower details

  const fetchFlowerDetails = async () => {
    try {
      const response = await api.get(`Flowers/${id}`); // Fetch flower details from API
      setFlower(response.data); // Update state with the fetched data
    } catch (err) {
      console.log(err); // Handle errors
    }
  };

  useEffect(() => {
    fetchFlowerDetails(); // Fetch flower details when component mounts
  }, [id]);

  if (!flower) return <div>Loading...</div>; // Show loading state

  return (
    <div className="product-detail">
      <img src={flower.imageUrl} alt={flower.flowerName} />
      <h1>{flower.flowerName}</h1>
      <p>Price: {flower.price.toLocaleString()}₫</p>
      <p>Condition: {flower.condition}</p>
      <p>Status: {flower.status}</p>
      <p>Quantity: {flower.quantity}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default ProductDetail;