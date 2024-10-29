import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import ProductCard from "../../component/product-card";
import UserAvatar from "../user/UserAvatar";
import ChatButton from "../../component/chatButton";

const PersonalProduct = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

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
      setSellerProducts([]); // Set empty array if error
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const response = await api.get(`Users/${userId}`);
      setSellerProfile(response.data);
    } catch (err) {
      console.error("Error fetching seller profile:", err);
      setSellerProfile(null);
    }
  };

  const fetchIsFollowing = async () => {
    try {
      const response = await api.get(`/SellerFollow/is-following`, {
        params: {
          userId: currentUserId,
          sellerId: userId
        }
      });
      setIsFollowing(response.data);
      console.log(response.data)
    } catch (err) {
      console.error("Error checking following status:", err);
    }
  };

  useEffect(() => {
    if (currentUserId && userId) {
      fetchIsFollowing();
    }
  }, [currentUserId, userId]);

  useEffect(() => {
    fetchCurrentUser();
    fetchSellerProducts();
    fetchSellerProfile();
  }, [userId]);

  useEffect(() => {
    setLoading(false);
  }, [sellerProducts, sellerProfile]);

  const handleChat = () => {
    navigate(`/chat/${userId}`);
  };

  const handleManageOrders = () => {
    navigate(`/seller/${userId}/orders`);
  };

  const handleManageProducts = () => {
    navigate(`/manage-products/${userId}`);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.post(`/SellerFollow/unfollow`, { userId: currentUserId, sellerId: userId });
        setFollowerCount(prev => prev - 1);
      } else {
        await api.post(`/SellerFollow/follow`, { userId: currentUserId, sellerId: userId });
        setFollowerCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error handling follow/unfollow:", err);
      fetchFollowerCount();
    }
  };

  const handleRevenue = () => {
    navigate(`/manage-revenue/${userId}`);
  };

  const handleOrders = () => {
    navigate(`/manage-orders/${userId}`);
  };

  const fetchFollowerCount = async () => {
    try {
      const response = await api.get(`SellerFollow/followers-count/${userId}`);
      setFollowerCount(response.data);
    } catch (error) {
      console.error('Error fetching follower count:', error);
      setFollowerCount(0);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFollowerCount();
    }
  }, [userId]);

  const fetchReviewCount = async () => {
    try {
      const response = await api.get(`Reviews/count-all-flowers/${userId}`);
      setReviewCount(response.data);
    } catch (error) {
      console.error('Error fetching review count:', error);
      setReviewCount(0);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReviewCount();
    }
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        {sellerProfile && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <div className="flex items-center">
              <UserAvatar 
                userId={sellerProfile.userId} 
                userName={sellerProfile.fullName} 
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold">{sellerProfile.fullName}</h2>

                <div className="flex mt-2">
                  <div className="mr-6">
                    <span>Đánh Giá: </span>
                    <strong>{reviewCount}</strong>
                  </div>
                  <div className="mr-6">
                    <span>Sản Phẩm: </span><strong>{sellerProducts.length}</strong>
                  </div>
                  <div>
                    <span>Người Theo Dõi: </span>
                    <strong>{followerCount}</strong>
                  </div>
                </div>
                <div className="flex mt-2">
                <ChatButton sellerId={sellerProfile.userId} />
                {console.log('Product seller ID:', sellerProfile.userId)}
                {currentUserId !== parseInt(userId) && (
                    <button
                      className={`text-sm border border-gray-300 rounded-lg py-2 px-5 mr-2 hover:bg-gray-100 ${isFollowing ? 'text-sm border bg-red-500 border-red-500 rounded-lg py-2 px-5 mr-2 hover:bg-red-400' : ''}`}
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Bỏ Yêu Thích" : "Yêu Thích"}
                    </button>
                  )}
                  {currentUserId === parseInt(userId) && (
                    <>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 mr-2 hover:bg-gray-100" onClick={handleManageProducts}>
                        Quản lý sản phẩm
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 mr-2 hover:bg-gray-100" onClick={handleRevenue}>
                        Xem Doanh Thu
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-100" onClick={handleOrders}>
                        Xem Đơn Hàng
                      </button>
                    </>
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
