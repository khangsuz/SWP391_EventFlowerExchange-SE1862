import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faMagnifyingGlass, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import api from "../../config/axios";
import "./index.scss";
import { useCart } from "../../contexts/CartContext";

function Header({ setFilteredFlowers }) {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [searchValue, setSearchValue] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const handleMouseEnter = () => setSearchVisible(true);
  const handleMouseLeave = () => setSearchVisible(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log("User:", user);
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      fetchUserData();
    }

    return () => {
    };
  }, []);


  const fetchUserData = async () => {
    try {
      const response = await api.get(`Users/profile`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSubmitSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchValue)}`);
      setSearchVisible(false);
    }
  };

  const handleSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    if (setFilteredFlowers) {
      api.get(`/Flowers`).then(response => {
        setFilteredFlowers(response.data);
      }).catch(error => {
        console.error("Error resetting flower list:", error);
      });
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

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmitSearch();
    }
  };

  useEffect(() => {
    if (searchVisible) {
      setTimeout(() => {
        document.querySelector('input[type="text"]');
      }, 1000);
    }
  }, [searchVisible]);

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
          <li>
            <Link to="/products" className="text-gray-700 hover:text-gray-900"><p><b>Sản phẩm</b></p></Link>
          </li>
          <li className="relative group">
            <Link to="/events" className="flex items-center text-gray-700 hover:text-gray-900">
              <p><b>Hoa sự kiện</b></p>
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
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <div className="flex space-x-4">
        <Tippy
          content="Tìm kiếm"
          interactive={true}
          placement="top"
          trigger="mouseenter"
        >
          <button className="flex items-center" onClick={toggleSearch}>
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

        {searchVisible && (
          <div
            className="absolute right-16 mt-9 w-72 bg-white border-2 rounded-md shadow-lg"
            onMouseEnter={() => setSearchVisible(true)}
            onMouseLeave={() => setSearchVisible(false)}
          >
            <div className="relative flex w-full h-12 bg-white rounded-lg shadow-lg">
              <input
                type="text"
                value={searchValue}
                spellCheck={false}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                placeholder="Search flowers"
                className="pl-4 pr-10 rounded-lg w-full text-black outline-none flex-1"
              />
              {searchValue && (
                <button
                  className="text-black outline-none absolute right-14 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={handleClear}
                >
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              )}
              <button
                className="text-gray-400 outline-none w-12 h-full hover:bg-gray-100 rounded-r-lg cursor-pointer text-lg"
                onClick={handleSubmitSearch}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>
        )}
        {currentUser && (
          <Tippy content="Thông báo" placement="top">
            <div className="relative flex items-center justify-center cursor-pointer" onClick={handleNotificationClick}>
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
        )}
        {showNotifications && (
          <div className="absolute right-10 mt-8 w-80 bg-white border-2 rounded-md shadow-lg overflow-hidden z-20">
            <div className="py-2">
              {Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.notificationId} className={`px-2 py-2 hover:bg-gray-100 ${notification.isRead ? 'opacity-50' : ''}`}>
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