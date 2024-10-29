import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import api from "../../config/axios";
import "./index.scss";
import { useCart } from "../../contexts/CartContext";
import Notification from "../notification";
import { HubConnectionBuilder } from "@microsoft/signalr";

function Header({ setFilteredFlowers }) {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [searchValue, setSearchValue] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connection, setConnection] = useState(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      setUserType(parsedUser.userType);
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      setupSignalR();
    }
  }, [currentUser]);

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
      const response = await api.get('Notification?page=1&pageSize=10');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const setupSignalR = async () => {
    try {
      const newConnection = new HubConnectionBuilder()
        .withUrl("https://localhost:7288/notificationHub", {
          withCredentials: true
        })
        .withAutomaticReconnect()
        .build();

      await newConnection.start();
      console.log("Connected to SignalR");

      newConnection.on("ReceiveNotification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      setConnection(newConnection);
    } catch (error) {
      console.error("SignalR Connection Error:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  // Search related functions
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

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmitSearch();
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(prev => !prev);
  };

  return (
    <div className="header">
      {/* Logo */}
      <Link to={"/"}>
        <img
          src="https://i.postimg.cc/tCjpf50j/Black-and-Pink-Flower-Shop-Logo-1-removebg-preview.png"
          alt="Logo"
          width={100}
        />
      </Link>

      {/* Navigation Menu */}
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
            </Link>
          </li>
          <li>
            {userType === 'Admin' && (
              <Link to="/admin/dashboard">
                <button className="text-red-500 hover:text-red-700 font-bold">
                  Admin
                </button>
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Right Side Icons */}
      <div className="flex space-x-4">
        {/* Search Icon */}
        <Tippy content="Tìm kiếm" placement="top">
          <button className="flex items-center" onClick={toggleSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </Tippy>

        {/* Search Input */}
        {searchVisible && (
          <div className="absolute right-16 mt-9 w-72 bg-white border-2 rounded-md shadow-lg">
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

        {/* Notification Bell */}
        {currentUser && (
          <Tippy content="Thông báo" placement="top">
            <div className="relative flex items-center justify-center cursor-pointer" onClick={handleNotificationClick}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className={`size-6 notification-bell ${notifications.some(n => !n.isRead) ? 'has-new' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {notifications.length > 0 && notifications.some(n => !n.isRead) && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </div>
          </Tippy>
        )}

        {/* Notification Panel */}
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-4 mt-2 z-50 transform translate-y-2">
            <Notification 
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        )}

        {/* User Profile Icon */}
        {currentUser ? (
          <Tippy content={`Hi, ${userData ? userData.fullName : 'User'}`} placement="bottom">
            <Link to={"/profile"}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Link>
          </Tippy>
        ) : (
          <Tippy content="Tài khoản" placement="bottom">
            <Link to={"/login"}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Link>
          </Tippy>
        )}

        {/* Cart Icon */}
        <Tippy content="Giỏ hàng" placement="bottom">
          <Link to={"/cart"} className="relative flex items-center justify-center header-cart-link">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
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
