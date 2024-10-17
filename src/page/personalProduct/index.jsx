import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import ProductCard from "../../component/product-card";

const PersonalProduct = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/Users/current-user");
      setCurrentUserId(response.data.userId);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchSellerProducts = async () => {
    try {
      const response = await api.get(`Flowers/seller/${userId}`);
      setSellerProducts(response.data);
    } catch (err) {
      console.error("Error fetching seller products:", err);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const response = await api.get(`Users/${userId}`);
      setSellerProfile(response.data);
    } catch (err) {
      console.error("Error fetching seller profile:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchSellerProducts();
    fetchSellerProfile();
  }, [userId]);
  

  useEffect(() => {
    if (sellerProducts.length > 0) {
      setLoading(false);
    }
  }, [sellerProducts]);

  const handleChat = () => {
    navigate(`/chat/${userId}`);
  };

  const handleManageProducts = () => {
    navigate(`/manage-products/${userId}`);
  };

  const handleRevenue = () => {
    navigate(`/manage-revenue/${userId}`);
  };

  const handleOrders = () => {
    navigate(`/manage-orders/${userId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        {sellerProfile && (
          <div className="mb-6 p-6 border border-gray-300 rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105">
          <div className="flex items-start">
            <img
              src={sellerProfile.profileImageUrl}
              alt={sellerProfile.name}
              className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md transition-transform transform hover:scale-105"
            />
            <div className="ml-5">
              <h2 className="text-4xl font-bold text-gray-800 hover:text-blue-500 transition duration-300">{sellerProfile.name}</h2>
              <div className="flex mt-3 space-x-8 text-gray-600 text-lg">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Đánh Giá:</span>
                  <strong className="text-blue-600 ml-1">{sellerProfile.rating || 0}</strong>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Sản Phẩm:</span>
                  <strong className="text-blue-600 ml-1">{sellerProfile.productCount || 0}</strong>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Người Theo Dõi:</span>
                  <strong className="text-blue-600 ml-1">{sellerProfile.followers || 0}</strong>
                </div>
              </div>
              <div className="flex mt-5 space-x-3">
                <button
                  className="chat-button text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-2 px-5 shadow hover:bg-gradient-to-l transition duration-300 transform hover:scale-105"
                  onClick={handleChat}
                >
                  Chat Ngay
                </button>
                <button className="text-sm text-blue-600 border-2 border-blue-600 rounded-lg py-2 px-5 hover:bg-blue-600 hover:text-white transition duration-300 transform hover:scale-105">
                  Yêu Thích
                </button>
                {currentUserId === parseInt(userId) && (
                  <div className="flex space-x-3">
                    <button
                      className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-100 transition duration-300 transform hover:scale-105"
                      onClick={handleManageProducts}
                    >
                      Quản lý sản phẩm
                    </button>
                    <button
                      className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-100 transition duration-300 transform hover:scale-105"
                      onClick={handleRevenue}
                    >
                      Xem Doanh Thu
                    </button>
                    <button
                      className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-100 transition duration-300 transform hover:scale-105"
                      onClick={handleOrders}
                    >
                      Xem Đơn Hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        
        )}
        <h1 className="text-2xl font-bold mb-6">Sản phẩm của người bán</h1>
        <div className="product-grid">
          {sellerProducts.length > 0 ? (
            sellerProducts.map((product) => (
              <div key={product.flowerId} className="product-grid-item">
                <ProductCard flower={product} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-lg text-gray-600">Người bán này chưa có sản phẩm nào.</p>
              {currentUserId === parseInt(userId) && (
                <button
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleManageProducts}
                >
                  Thêm sản phẩm mới
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PersonalProduct;
