import React, { useState } from "react";
import "./index.scss";
import { Link, useNavigate } from "react-router-dom";
function Header() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(0);
  return (
    <div className="header">
      <Link to={"/"}>
        <img
          className=""
          src="https://i.postimg.cc/tCjpf50j/Black-and-Pink-Flower-Shop-Logo-1-removebg-preview.png"
          alt=""
          width={100}
        />
      </Link>
      <div className="flex justify-between items-center">
        <ul className="flex space-x-10">
          <li>
            <Link to="/" className="text-gray-700 hover:text-gray-900">Trang Chủ</Link>
          </li>
          <li>
            <Link to="/about" className="text-gray-700 hover:text-gray-900">Giới Thiệu</Link>
          </li>
          <li className="relative group">
            <Link to="/products" className="flex items-center text-gray-700 hover:text-gray-900">
              Sản phẩm
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
              className="absolute left-0 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownHoverButton"
              >
                <li>
                  <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    Product1
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    Product2
                  </Link>
                </li>
                <li>
                  <Link to="/earnings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    Product3
                  </Link>
                </li>
                <li>
                  <Link to="/logout" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    Product4
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/events" className="text-gray-700 hover:text-gray-900">Hoa Sự Kiện</Link>
          </li>
          <li>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900">Liên Hệ</Link>
          </li>
        </ul>
      </div>
      <div className="flex space-x-4">
        <Link to={"/"}
          title="h_search"
        >
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
        </Link>
        <Link to={"/login"}
          title="h_login"
        >
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
        <Link to={"/cart"}
          title="h_cart"
          className="relative flex items-center justify-center header-cart-link icon button circle is-outline is-small"
        >
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
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {cartItems}
            </span>
          )}
          <i className="icon-shopping-basket ml-2"></i>
        </Link>
      </div>
    </div>
  );
}

export default Header;
