
import React, { useState, useEffect } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";

function Header({ setFilteredFlowers }) {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [searchValue, setSearchValue] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.log("Header useEffect running");
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log("Token:", token);
    console.log("User:", user);
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      fetchUserData();
    }
    fetchNotifications();
    return () => { };
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`Users/profile`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`Notification`);
      console.log("Notifications response:", response.data);
      // Ensure we're setting an array
      setNotifications(Array.isArray(response.data.notifications) ? response.data.notifications : []);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      setNotifications([]); // Set to empty array on error
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`Notification/${id}`);
      setNotifications(prevNotifications =>
        Array.isArray(prevNotifications)
          ? prevNotifications.map(n =>
            n.notificationId === id ? { ...n, isRead: true } : n
          )
          : []
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchValue(query);
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    try {
      const response = await api.get(`/Flowers`);
      const flowers = response.data;

      if (setFilteredFlowers) {
        if (query.length === 0) {
          setFilteredFlowers(flowers);
        } else {
          const filtered = flowers.filter(flower =>
            flower.flowerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
          );
          setFilteredFlowers(filtered);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      if (setFilteredFlowers) {
        setFilteredFlowers([]);
      }
    }
  };

  const handleFilterByCategory = async (categoryId) => {
    navigate('/products', { state: { categoryId } });
    try {
      const [categoryResponse, allFlowersResponse] = await Promise.all([
        api.get(`/Categories/${categoryId}`),
        api.get('/Flowers')
      ]);
      const filteredFlowers = allFlowersResponse.data.filter(
        flower => flower.categoryId === categoryId
      );

      if (setFilteredFlowers) {
        setFilteredFlowers(filteredFlowers);
        navigate('/products');
      }
    } catch (error) {
      console.error("Error fetching and filtering flowers:", error);
      if (setFilteredFlowers) {
        setFilteredFlowers([]);
      }
    }
  };

  return (
    <div className="header">
      <div onClick={() => handleNavigation("/")} className="cursor-pointer">
        <img
          src="https://i.postimg.cc/tCjpf50j/Black-and-Pink-Flower-Shop-Logo-1-removebg-preview.png"
          alt="Logo"
          width={100}
        />
      </div>
      <div className="flex justify-between items-center">
        <ul className="flex space-x-10">
          <li>
            <div onClick={() => handleNavigation("/")} className="text-gray-700 hover:text-gray-900 cursor-pointer"><p><b>Trang Chủ</b></p></div>
          </li>
          <li>
            <div onClick={() => handleNavigation("/about")} className="text-gray-700 hover:text-gray-900 cursor-pointer"><p><b>Giới Thiệu</b></p></div>
          </li>
          <li className="relative group">
            <div onClick={() => handleNavigation("/products")} className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer">
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
            </div>
            <div
              id="dropdownHover"
              className="absolute left-0 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
            >
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <div onClick={() => handleFilterByCategory(1)} className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Hoa sinh nhật</div>
                </li>
                <li>
                  <div onClick={() => handleFilterByCategory(5)} className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Hoa thiên nhiên</div>
                </li>
                <li>
                  <div onClick={() => handleFilterByCategory(4)} className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Hoa đám cưới</div>
                </li>
                <li>
                  <div onClick={() => handleFilterByCategory(3)} className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Hoa văn phòng</div>
                </li>
                <li>
                  <div onClick={() => handleFilterByCategory(2)} className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Hoa tang lễ</div>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <div onClick={() => handleNavigation("/events")} className="text-gray-700 hover:text-gray-900 cursor-pointer"><p><b>Hoa Sự Kiện</b></p></div>
          </li>
        </ul>
      </div>
      <div className="flex space-x-4">
        <Tippy content="Thông báo" placement="bottom">
          <div className="relative flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 w-6 h-6 cursor-pointer"
              onClick={handleNotificationClick}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            {Array.isArray(notifications) && notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </div>
        </Tippy>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
            <div className="py-2">
              {Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.notificationId} className={`px-4 py-2 hover:bg-gray-100 ${notification.isRead ? 'opacity-50' : ''}`}>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.notificationDate).toLocaleString()}
                      - Created by: {notification.sellerName}
                    </p>
                    {!notification.isRead && (
                      <button onClick={() => markAsRead(notification.notificationId)} className="text-xs text-blue-500 mt-1">
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">Không có thông báo mới</p>
              )}
            </div>
          </div>
        )}
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
            <div onClick={() => handleNavigation("/profile")} className="cursor-pointer">
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
            </div>
          </Tippy>
        ) : (
          <Tippy content="Tài khoản" placement="bottom">
            <div onClick={() => handleNavigation("/login")} className="cursor-pointer">
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
            </div>
          </Tippy>
        )}
        <Tippy content="Giỏ hàng" placement="bottom">
          <div onClick={() => handleNavigation("/cart")} className="relative flex items-center justify-center header-cart-link cursor-pointer">
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
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007M8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {cartItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-gray-500 text-white text-sm rounded-full px-1.5 py">
                {cartItems}
              </span>
            )}
          </div>
        </Tippy>
      </div>
    </div>
  );
}

export default Header;