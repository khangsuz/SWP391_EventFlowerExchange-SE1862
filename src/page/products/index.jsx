// src/page/products/index.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";

const Products = () => {
  const [flowers, setFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  
  const location = useLocation();
  const categoryId = location.state?.categoryId;

  const fetchFlower = async () => {
    try {
      const response = await api.get("Flowers");
      setFlowers(response.data);
      if (categoryId) {
        const filtered = response.data.filter(flower => flower.categoryId === categoryId);
        setFilteredFlowers(filtered);
      } else {
        setFilteredFlowers(response.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFlower();
  }, [categoryId]);

  return (
    <div className="products__main">
      <Header setFilteredFlowers={setFilteredFlowers} />
      <div className="collection-top-bar">
        <div className="text-center collection-title mt-7">
          <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        </div>
      </div>
      <div className="home__main-content">
        {filteredFlowers.length > 0 ? (
          filteredFlowers.map((flower) => (
            <ProductCard key={flower.flowerId} flower={flower} />
          ))
        ) : (
          <p>Không có sản phẩm nào</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;