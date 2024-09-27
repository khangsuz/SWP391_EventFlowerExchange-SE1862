// src/page/products/index.jsx
import React, { useEffect, useState } from "react";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";

const Products = () => {
  const [flowers, setFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]); // State for filtered flowers

  const fetchFlower = async () => {
    try {
      const response = await api.get("Flowers");
      setFlowers(response.data);
      setFilteredFlowers(response.data); // Initialize filtered flowers
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFlower();
  }, []);

  return (
    <div className="products__main">
      <Header setFilteredFlowers={setFilteredFlowers} /> {/* Pass the setter function */}
      <div className="collection-top-bar">
        <div className="text-center collection-title mt-7">
          <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        </div>
      </div>
      <div className="home__main-content">
        {filteredFlowers.map((flower) => (
          <ProductCard key={flower.flowerId} flower={flower} />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Products;