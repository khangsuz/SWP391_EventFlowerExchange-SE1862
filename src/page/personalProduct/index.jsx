import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import { Notification } from "../../component/alert";
import UserAvatar from "../user/UserAvatar";

const PersonalProduct = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentUserResponse, sellerProductsResponse, sellerProfileResponse, followersCountResponse] = await Promise.all([
        api.get("/Users/current-user"),
        api.get(`Flowers/seller/${userId}`),
        api.get(`Users/${userId}`),
        api.get(`/SellerFollow/followers-count/${userId}`)
      ]);

      setCurrentUserId(currentUserResponse.data.userId);
      setSellerProducts(sellerProductsResponse.data);
      setSellerProfile({
        ...sellerProfileResponse.data,
        followers: followersCountResponse.data
      });

      if (currentUserResponse.data.userId) {
        const isFollowingResponse = await api.get(`/SellerFollow/is-following`, {
          params: {
            userId: currentUserResponse.data.userId,
            sellerId: userId
          }
        });
        setIsFollowing(isFollowingResponse.data);
      }

      // Fetch total reviews for all products
      let totalReviewsCount = 0;
      for (const product of sellerProductsResponse.data) {
        const reviewCountResponse = await api.get(`/Reviews/count/${product.flowerId}`);
        totalReviewsCount += reviewCountResponse.data;
      }
      setTotalReviews(totalReviewsCount);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      } else {
        await api.post(`/SellerFollow/follow`, { userId: currentUserId, sellerId: userId });
      }
      await fetchData(); // Refresh all data after follow/unfollow
    } catch (err) {
      console.error("Error handling follow/unfollow:", err);
    }
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
      <Notification />
      <Header />
      <div className="container mx-auto py-24">
        {sellerProfile && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <div className="flex items-center">
              <UserAvatar
                userId={sellerProfile.userId}
                userName={sellerProfile.name}
                className="w-16 h-16" // Adjust size as needed
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold">{sellerProfile.name}</h2>
                <div className="flex mt-2">
                  <div className="mr-6">
                    <span>Đánh Giá: </span><strong>{totalReviews}</strong>
                  </div>
                  <div className="mr-6">
                    <span>Sản Phẩm: </span><strong>{sellerProducts.length}</strong>
                  </div>
                  <div className="mr-6">
                    <span>Người Theo Dõi: </span><strong>{sellerProfile.followers}</strong>
                  </div>
                </div>
                <div className="flex mt-2">
                  {currentUserId === parseInt(userId) && (
                    <button className="chat-button text-sm border border-gray-300 rounded py-1 px-2 mr-2" onClick={handleManageOrders}>
                      Quản lí đơn hàng
                    </button>
                  )}
                  {currentUserId !== parseInt(userId) && (
                    <button className="chat-button text-sm border border-gray-300 rounded py-1 px-2 mr-2" onClick={handleChat}>
                      Chat Ngay
                    </button>
                  )}
                  {currentUserId !== parseInt(userId) && (
                    <button
                      className={`text-sm border border-gray-300 rounded py-1 px-2 ${isFollowing ? 'bg-red-500 text-white' : ''}`}
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Bỏ Yêu Thích" : "Yêu Thích"}
                    </button>
                  )}
                  {currentUserId === parseInt(userId) && (
                    <>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 mr-2" onClick={handleManageProducts}>
                        Quản lý sản phẩm
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 mr-2" onClick={handleRevenue}>
                        Xem Doanh Thu
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5" onClick={handleOrders}>
                        Xem Đơn Hàng
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 mr-2" onClick={handleChat}>
                        Chat Ngay
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-6">Sản phẩm của người bán</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sellerProducts.length > 0 ? (
            sellerProducts.map((product) => (
              <div key={product.flowerId} className="product-grid-item">
                <ProductCard flower={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
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