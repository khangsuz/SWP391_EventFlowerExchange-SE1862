import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import { Notification } from "../../component/alert";
import LoadingComponent from '../../component/loading'; // Import LoadingComponent

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

  if (loading) return <LoadingComponent />; // Show loading component

  return (
    <>
      <Notification />
      <Header />
      <div className="container mx-auto py-24">
        {sellerProfile && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <div className="flex items-center">
              <img src={sellerProfile.profileImageUrl || 'default-image-url'} alt={sellerProfile.name} className="w-10 h-10 rounded-full mr-2" />
              <div className="ml-2">
                <h2 className="text-xl font-bold">{sellerProfile.fullName}</h2>
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
                <div className="flex mt-2 gap-2">
                  {currentUserId === parseInt(userId) && (
                    <>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-200 hover:text-black" onClick={handleManageProducts}>
                        Quản lí sản phẩm
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-200 hover:text-black" onClick={handleRevenue}>
                        Xem Doanh Thu
                      </button>
                      <button className="text-sm border border-gray-300 rounded-lg py-2 px-5 hover:bg-gray-200 hover:text-black" onClick={handleOrders}>
                        Xem Đơn Hàng
                      </button>
                    </>
                  )}
                  {currentUserId !== parseInt(userId) && (
                    <>
                      <button className="chat-button text-sm border border-gray-300 rounded py-1 px-2 mr-2" onClick={handleChat}>
                        Chat Ngay
                      </button>
                      <button
                        className={`text-sm border border-gray-300 rounded py-1 px-2 ${isFollowing ? 'bg-red-500 text-white' : ''}`}
                        onClick={handleFollow}
                      >
                        {isFollowing ? "Bỏ Yêu Thích" : "Yêu Thích"}
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
