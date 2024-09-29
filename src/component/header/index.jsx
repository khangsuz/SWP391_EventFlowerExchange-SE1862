// src/component/header/index.jsx
import React, { useState, useEffect, useRef } from "react";
import "./index.scss";
import { Link, useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import api from "../../config/axios";

function Header({ setFilteredFlowers }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [cartItems, setCartItems] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/Users/profile');
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const updateCartItemCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartItems(totalItems);
  };

  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchValue(query);
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    try {
      const response = await api.get(`/Flowers`);
      const flowers = response.data;

      if (query.length === 0) {
        setFilteredFlowers(flowers);
      } else {
        const filtered = flowers.filter(flower =>
          flower.flowerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
        );
        setFilteredFlowers(filtered);
      }
    } catch (error) {
      console.error("Search error:", error);
      setFilteredFlowers([]);
    }
  };

  const handleFilterByCategory = async (categoryId) => {
    try {
      const [categoryResponse, allFlowersResponse] = await Promise.all([
        api.get(`/Categories/${categoryId}`),
        api.get('/Flowers')
      ]);
      const filteredFlowers = allFlowersResponse.data.filter(
        flower => flower.categoryId === categoryId
      );
      setFilteredFlowers(filteredFlowers);
      navigate('/products');
    } catch (error) {
      console.error("Error fetching and filtering flowers:", error);
      setFilteredFlowers([]);
    }
  };

  useEffect(() => {
    console.log("Header useEffect running");
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log("Token:", token);
    console.log("User:", user);

    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }

    fetchUserData();
    updateCartItemCount();

    return () => {
    };
  }, []);

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
                onChange={handleSearch}
                placeholder="Search..."
                className="px-4 py-2 border rounded-lg w-full text-black"
                
              />
            </div>
          }
          interactive={true}
          placement="bottom"
          trigger="mouseenter"
          onShow={(instance) => {
            setTimeout(() => {
              instance.popper.querySelector('input').focus();
            }, 0);
          }}
        >
          <button className="flex items-center">
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
          </button>
        </Tippy>
        {currentUser ? (
          <Tippy content={`Hi, ${userData ? userData.name : 'User'}`} placement="bottom">
            <Link to={"/profile"}>
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
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {cartItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-gray-500 text-white text-sm rounded-full px-1.5 py">
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