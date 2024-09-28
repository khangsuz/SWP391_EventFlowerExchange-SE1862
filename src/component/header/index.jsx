// src/component/header/index.jsx
import React, { useState } from "react";
import "./index.scss";
import { Link, useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import api from "../../config/axios"; // Import axios instance

function Header({ setFilteredFlowers }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [cartItems, setCartItems] = useState(0);
  const currentUser = false; // Placeholder for actual user state

  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchValue(query);
    
    // Normalize the search input to remove accents
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
    if (query.length === 0) {
      // If the search box is empty, reset to show all products
      try {
        const response = await api.get(`/Flowers`); // Fetch all flowers again if needed
        setFilteredFlowers(response.data); // Show all products
      } catch (error) {
        console.error("Error fetching all flowers:", error);
        setFilteredFlowers([]); // Clear results on error
      }
    } else if (query.length >= 1) {
      try {
        console.log(`Searching for: ${query}`);
        const response = await api.get(`/Flowers`); // Fetch all flowers to filter them locally
        console.log("API Response:", response.data);
  
        if (response.data && response.data.length > 0) {
          // Normalize the flower names and filter based on the normalized query
          const filtered = response.data.filter(flower => 
            flower.flowerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
          );
          
          setFilteredFlowers(filtered); // Set the filtered flowers
        } else {
          setFilteredFlowers([]); // Clear if no results
        }
      } catch (error) {
        console.error("Search error:", error);
        setFilteredFlowers([]); // Clear results on error
      }
    }
  };

  const handleFilterByCategory = async (categoryId) => {
    try {
      // Fetch the category details
      const categoryResponse = await api.get(`/Categories/${categoryId}`);
      console.log("Category details:", categoryResponse.data);
  
      // Fetch all flowers
      const allFlowersResponse = await api.get('/Flowers');
      
      // Filter flowers by category on the client side
      const filteredFlowers = allFlowersResponse.data.filter(
        flower => flower.categoryId === categoryId
      );
  
      console.log("Filtered Flowers:", filteredFlowers);
  
      // Update the filtered flowers state
      setFilteredFlowers(filteredFlowers);
  
      // Navigate to the products page
      navigate('/products');
    } catch (error) {
      console.error("Error fetching and filtering flowers:", error);
      setFilteredFlowers([]);
    }
  };

  return (
    <div className="header">
      <Link to={"/"}>
        <img
          src="https://i.postimg.cc/tCjpf50j/Black-and-Pink-Flower-Shop-Logo-1-removebg-preview.png"
          alt="Logo"
          width={100}
        />
      </Link>
      <div className="flex justify-between items-center">
        <ul className="flex space-x-10">
          <li>
            <Link to="/" className="text-gray-700 hover:text-gray-900"><p><b>Trang Chủ</b></p></Link>
          </li>
          <li>
            <Link to="/about" className="text-gray-700 hover:text-gray-900"><p><b>Giới Thiệu</b></p></Link>
          </li>
          <li className="relative group">
            <Link to="/products" className="flex items-center text-gray-700 hover:text-gray-900">
              <p><b>Sản Phẩm</b></p>
              <i className="ml-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 9.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </i>
            </Link>
            {/* Dropdown Menu */}
            <div
              id="dropdownHover"
              className="absolute left-0 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
            >
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <Link to="#" onClick={() => handleFilterByCategory(1)} className="block px-4 py-2 hover:bg-gray-100">Hoa sinh nhật</Link>
                </li>
                <li>
                  <Link to="#" onClick={() => handleFilterByCategory(5)} className="block px-4 py-2 hover:bg-gray-100">Hoa thiên nhiên</Link>
                </li>
                <li>
                  <Link to="#" onClick={() => handleFilterByCategory(4)} className="block px-4 py-2 hover:bg-gray-100">Hoa đám cưới</Link>
                </li>
                <li>
                  <Link to="#" onClick={() => handleFilterByCategory(3)} className="block px-4 py-2 hover:bg-gray-100">Hoa văn phòng</Link>
                </li>
                <li>
                  <Link to="#" onClick={() => handleFilterByCategory(2)} className="block px-4 py-2 hover:bg-gray-100">Hoa tang lễ</Link>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/events" className="text-gray-700 hover:text-gray-900"><p><b>Hoa Sự Kiện</b></p></Link>
          </li>
        </ul>
      </div>
      <div className="flex space-x-4">
        <Tippy
          content={
            <div className="p-2 bg-white rounded-md shadow-lg">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch} // Update search on input change
                placeholder="Search..."
                className="px-4 py-2 border rounded-lg w-full text-black"
              />
            </div>
          }
          interactive={true}
          placement="bottom"
          trigger="click"
        >
          <a href="#">
            <i>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </i>
          </a>
        </Tippy>

        {currentUser ? (
          <Tippy content="Hello, Username" placement="bottom">
            <Link to={"/account"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>
          </Tippy>
        ) : (
          <Tippy content="Tài khoản" placement="bottom">
            <Link to={"/login"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>
          </Tippy>
        )}

        <Tippy content="Giỏ hàng" placement="bottom">
          <Link to={"/cart"} className="relative flex items-center justify-center header-cart-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.72a.75.75 0 0 1 .723.569L5.3 6m0 0 1.09 4.8m14.64-4.8h-3.514a.75.75 0 0 0-.723.569L14.7 6m5.4 0 1.182 5.2m-16.968 0h12.673a.75.75 0 0 0 .723-.569L19.1 6M6.391 11.2l-1.09-4.8m1.09 4.8-.723 3.2M8.1 16.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
              />
            </svg>
            {cartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full px-1.5 py-0.5">
                {cartItems}
              </span>
            )}
          </Link>
        </Tippy>
      </div>
    </div>
  );
}

export default Header;