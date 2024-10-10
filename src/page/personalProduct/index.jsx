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
    fetchSellerProducts();
    fetchSellerProfile();
  }, [userId]);

  useEffect(() => {
    if (sellerProducts.length > 0) {
      setLoading(false);
    }
  }, [sellerProducts]);

  const handleChat = () => {
    navigate(`/chat/${userId}`); // Redirect to chat page
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        {sellerProfile && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <div className="flex items-center">
              <img src={sellerProfile.profileImageUrl} alt={sellerProfile.name} className="w-10 h-10 rounded-full mr-2" />
              <div className="ml-2">
                <h2 className="text-xl font-bold">{sellerProfile.name}</h2>
                
                <div className="flex mt-2">
                  <div className="mr-6">
                    <span>Đánh Giá: </span><strong>{sellerProfile.rating || 0}</strong>
                  </div>
                  <div className="mr-6">
                    <span>Sản Phẩm: </span><strong>{sellerProfile.productCount || 0}</strong>
                  </div>
                  <div>
                    <span>Người Theo Dõi: </span><strong>{sellerProfile.followers || 0}</strong>
                  </div>
                </div>
                <div className="flex mt-2">
                  <button className="chat-button text-sm border border-gray-300 rounded py-1 px-2 mr-2" onClick={handleChat}>
                    Chat Ngay
                  </button>
                  <button className="text-sm border border-gray-300 rounded py-1 px-2" onClick={() => {}}>
                    Yêu Thích
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-6">Sản phẩm của người bán</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellerProducts.length > 0 ? (
            sellerProducts.map((product) => (
              <ProductCard key={product.flowerId} flower={product} />
            ))
          ) : (
            <p>Không có sản phẩm nào từ người bán này.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PersonalProduct;
