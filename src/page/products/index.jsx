import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import Footer from "../../component/footer";
import api from "../../config/axios";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import "./index.scss";
import { Notification } from "../../component/alert";
import LoadingComponent from '../../component/loading'; // Import LoadingComponent

const Products = () => {
  const [flowers, setFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [flowersPerPage] = useState(12);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortOption, setSortOption] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const location = useLocation();
  const categoryId = location.state?.categoryId;

  const fetchFlower = async () => {
    setLoading(true); // Set loading to true
    try {
      const response = await api.get("Flowers");
      setFlowers(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFlowers = (flowers) => {
    let filtered = [...flowers];

    filtered = filtered.filter(flower => flower.price >= priceRange[0] && flower.price <= priceRange[1]);

    switch (sortOption) {
      case "name-asc":
        filtered.sort((a, b) => a.flowerName.localeCompare(b.flowerName));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.flowerName.localeCompare(a.flowerName));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return filtered;
  };

  useEffect(() => {
    fetchFlower();
  }, []);

  useEffect(() => {
    if (flowers.length > 0) {
      let filtered = flowers;
      if (categoryId) {
        filtered = filtered.filter(flower => flower.categoryId === categoryId);
      }
      filtered = filterAndSortFlowers(filtered);
      setFilteredFlowers(filtered);
      setCurrentPage(1);
    }
  }, [flowers, categoryId, priceRange, sortOption]);

  const indexOfLastFlower = currentPage * flowersPerPage;
  const indexOfFirstFlower = indexOfLastFlower - flowersPerPage;
  const currentFlowers = filteredFlowers.slice(indexOfFirstFlower, indexOfLastFlower);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredFlowers.length / flowersPerPage); i++) {
    pageNumbers.push(i);
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const addToCart = (item, quantity) => {
    // ...
    const updatedCart = [...storedCart, { ...item, quantity: quantity, sellerName: flower.sellerName }];
    // ...
  };

  return (
    <div className="products__main">
      <Notification />
      <Header setFilteredFlowers={setFilteredFlowers} />
      {loading ? (
        <LoadingComponent /> // Show loading component
      ) : (
        <>
          <div className="filters-container">
            <button className="filter-toggle" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              Lọc & Sắp xếp {isFilterOpen ? '▲' : '▼'}
            </button>
            {isFilterOpen && (
              <div className="filters-wrapper">
                <div className="filter-group">
                  <label>Lọc theo giá:</label>
                  <Slider
                    range
                    min={0}
                    max={10000000}
                    value={priceRange}
                    onChange={setPriceRange}
                  />
                  <div className="price-range-display">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                </div>
                <div className="filter-group">
                  <label htmlFor="sortOption">Sắp xếp:</label>
                  <select
                    id="sortOption"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="filter-select"
                  >
                    <option value="default">Mặc định</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="home__main-content">
            {currentFlowers.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {currentFlowers.map((flower) => (
                  <div key={flower.flowerId} className="w-full">
                    <ProductCard flower={flower} />
                  </div>
                ))}
              </div>
            ) : (
              <p>Không có sản phẩm nào</p>
            )}
          </div>
          {filteredFlowers.length > flowersPerPage && (
            <div className="flex justify-center my-8">
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-4 py-2 border ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300'} transition-all duration-300`}
                >
                  {number}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default Products;
