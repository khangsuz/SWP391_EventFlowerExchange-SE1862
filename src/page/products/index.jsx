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
  const [currentPage, setCurrentPage] = useState(1);
  const [flowersPerPage] = useState(9);
  
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

  const indexOfLastFlower = currentPage * flowersPerPage;
  const indexOfFirstFlower = indexOfLastFlower - flowersPerPage;
  const currentFlowers = filteredFlowers.slice(indexOfFirstFlower, indexOfLastFlower);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredFlowers.length / flowersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="products__main">
      <Header setFilteredFlowers={setFilteredFlowers} />
      <div className="collection-top-bar">
        <div className="text-center collection-title mt-7">
          <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        </div>
      </div>
      <div className="home__main-content">
        {currentFlowers.length > 0 ? (
          currentFlowers.map((flower) => (
            <ProductCard key={flower.flowerId} flower={flower} />
          ))
        ) : (
          <p>Không có sản phẩm nào</p>
        )}
      </div>
      {filteredFlowers.length > flowersPerPage && (
        <div className="pagination">
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`pagination-button ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Products;