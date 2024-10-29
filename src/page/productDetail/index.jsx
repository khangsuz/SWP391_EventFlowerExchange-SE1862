import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../index.css";
import { useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import { getFullImageUrl } from '../../utils/imageHelpers';
import { Link } from "react-router-dom";
import { Notification, notifySuccess, notifyError } from "../../component/alert";

const ProductDetail = () => {
  const { updateCartItemCount } = useCart();
  const { id } = useParams();
  const [flower, setFlower] = useState(null);
  const [relatedFlowers, setRelatedFlowers] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, reviewComment: "" });
  const [canReview, setCanReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [seller, setSeller] = useState(null);
  const navigate = useNavigate();
  const imageUrl = flower ? getFullImageUrl(flower.imageUrl) : null;
  const [starFilter, setStarFilter] = useState(0);
  const [categories, setCategories] = useState({});
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        
        const response = await api.get("Categories");
        const categoriesMap = {};
        response.data.forEach(category => {
          categoriesMap[category.categoryId] = category.categoryName;
        });
        setCategories(categoriesMap);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };



    fetchCategories();
  }, []);
  const getCategorySlug = (categoryName) => {
    const removeAccents = (str) => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    return removeAccents(categoryName).toLowerCase().replace(/ /g, '-');
  };

  const handleCategoryClick = (categoryName) => {
    const slug = getCategorySlug(categoryName);
    navigate(`/events/${slug}`);
  };
  const fetchFlowerDetails = async () => {
    try {
      const response = await api.get(`Flowers/${id}`);
      setFlower(response.data);

      if (response.data && response.data.userId) {
        const sellerResponse = await api.get(`Users/${response.data.userId}`);
        setSeller(sellerResponse.data);
      }

      if (response.data && response.data.categoryId) {
        fetchRelatedFlowers(response.data.categoryId);
      }
      const timeRemaining = renderTimeRemaining(response.data.listingDate);
      setIsExpired(timeRemaining === 'Hết hạn');
    } catch (err) {
      console.error("Error fetching flower details:", err);
    }
  };


  const handleChat = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      alert("Vui lòng đăng nhập để chat");
      return;
    }
    if (!seller) {
      alert("Không thể tìm thấy thông tin người bán");
      return;
    }
    try {
      const response = await api.post('/api/Conversation/create', {
        buyerId: parseInt(currentUser.userId),
        sellerId: parseInt(seller.userId)
      });
      const conversationId = response.data.conversationId;
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
    }
  };

  const fetchRelatedFlowers = async (categoryId) => {
    try {
      const response = await api.get(`Flowers`);
      if (response.data && Array.isArray(response.data)) {
        const related = [];
        for (let i = 0; i < response.data.length; i++) {
          const flower = response.data[i];
          if (flower.categoryId === categoryId && flower.flowerId !== parseInt(id)) {
            related.push({
              ...flower,
              imageUrl: getFullImageUrl(flower.imageUrl)
            });
          }
        }
        console.log("Related flowers:", related);
        setRelatedFlowers(related);
      } else {
        console.error("Unexpected API response structure:", response.data);
      }
    } catch (err) {
      console.error("Error fetching related flowers:", err);
    }
  };
  const fetchReviews = async () => {
    try {
      const response = await api.get(`Reviews/flower/${id}`);
      console.log("Reviews data:", response.data.reviews);
      setAverageRating(response.data.averageRating || 0);
  
      // Lấy thông tin hồ sơ cho mỗi đánh giá
      const reviewsWithProfiles = await Promise.all(response.data.reviews.map(async (review) => {
        try {
          const userResponse = await api.get(`Users/${review.userId}`);
          return {
            ...review,
            profileImageUrl: userResponse.data.profileImageUrl
          };
        } catch (error) {
          console.error(`Error fetching profile for user ${review.userId}:`, error);
          return review; // Trả về đánh giá gốc nếu không lấy được thông tin hồ sơ
        }
      }));
  
      setReviews(reviewsWithProfiles);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const userReview = reviewsWithProfiles.find(review => review.userId === user.userId);
        setUserReview(userReview);
        setNewReview(userReview || { rating: 5, reviewComment: "" });
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };


  const checkCanReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCanReview(false);
      return;
    }
    try {
      const response = await api.get(`Reviews/canReview/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCanReview(response.data);
    } catch (err) {
      console.error("Error checking review ability:", err);
      setCanReview(false);
    }
  };

  useEffect(() => {
    fetchFlowerDetails();
    fetchReviews().then(fetchedReviews => {
      setReviews(sortReviews(fetchedReviews));
    });
    checkCanReview();
  }, [id]);

  const addToCart = (item) => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = storedCart.find((cartItem) => cartItem.flowerId === item.flowerId);

    if (existingItem) {
      const updatedCart = storedCart.map((cartItem) =>
        cartItem.flowerId === item.flowerId
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...storedCart, { ...item, quantity: quantity }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        notifyError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
        return;
    }

    setLoading(true);
    try {
        const response = await api.post(
            "Cart/add-item", // Updated endpoint
            {
                FlowerId: flower.flowerId,
                Quantity: quantity,
                Price: flower.price,
                IsCustomOrder: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            notifySuccess(`${flower.flowerName} đã được thêm vào giỏ hàng!`);
            updateCartItemCount();
        } else {
            notifyError(response.data.message || "Thêm vào giỏ hàng thất bại!");
        }
    } catch (err) {
        console.error("Error adding to cart:", err);
        const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
        notifyError(errorMessage);
    } finally {
        setLoading(false);
    }
};


  const handleEditReview = (reviewId) => {
    setEditingReviewId(reviewId);
    const reviewToEdit = reviews.find(review => review.reviewId === reviewId);
    setNewReview({
      rating: reviewToEdit.rating,
      reviewComment: reviewToEdit.reviewComment
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`Reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notifySuccess("Đánh giá đã được xóa thành công!");
        fetchReviews();
      } catch (err) {
        console.error("Error deleting review:", err);
        notifyError("Không thể xóa đánh giá. Vui lòng thử lại sau!");
      }
    }
  };
  const handleReviewSubmit = async (e, reviewId = null) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !canReview) {
      alert("Bạn không có quyền đánh giá sản phẩm này.");
      return;
    }
    try {
      const userId = JSON.parse(localStorage.getItem("user")).userId;
      const reviewData = {
        ...newReview,
        flowerId: flower.flowerId,
        userId: userId,
      };

      let response;
      if (reviewId) {
        response = await api.put(`Reviews/${reviewId}`, reviewData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await api.post("Reviews", reviewData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response.status === 204 || response.data) {
        notifySuccess(reviewId ? "Đánh giá đã được cập nhật thành công!" : "Đánh giá đã được gửi thành công!");
        fetchReviews();
        setEditingReviewId(null);
        setNewReview({ rating: 5, reviewComment: "" });
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      notifyError("Bạn đã đánh giá sản phẩm này. Không thể đánh giá thêm!");
    }
  };
  const filteredReviews = reviews.filter(review => {
    return starFilter === 0 || review.rating === starFilter; 
  });
  
  const starCounts = Array(6).fill(0); 
  reviews.forEach(review => {
    starCounts[review.rating]++;
  });
   const renderTimeRemaining = (listingDate) => {
    const listingTime = new Date(listingDate).getTime();
    const currentTime = new Date().getTime();

    const localListingTime = listingTime + 7 * 60 * 60 * 1000;

    const timeRemaining = (24 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000)- (currentTime - localListingTime);

    if (timeRemaining > 0) {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m còn lại`;
    }

    return 'Hết hạn';
};
  
  if (!flower) return <div>Loading...</div>;

  return (
    <>
      <Notification />
      <Header />
      <div className="text-gray-700 body-font overflow-hidden bg-white product-detail">
        <div className="container px-5 py-24 mx-auto">
          <div className="lg:w-3/5 mx-auto flex flex-wrap">
            <img alt="ecommerce" className="lg:w-3/6 w-full object-cover object-center rounded border border-gray-200" src={imageUrl || "https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"} />
            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-3 lg:mt-0">
              {/* <h1 className="text-gray-900 text-3xl title-font font-medium mb-1 mt-3">{flower.flowerName}</h1>
              <span className="title-font font-medium text-xl text-[#bc0000]">{flower.price.toLocaleString()}₫</span> */}
              <h1 className="text-gray-900 text-4xl title-font font-medium mb-1 mt-3">{flower.flowerName}</h1>
              <p className="title-font mt-2 font-medium text-xl text-[#bc0000]">
                {flower.price > 0 ? flower.price.toLocaleString() + '₫' : '???đ'}
              </p>
              <div className="flex items-center mt-2">
                {/* <span className="text-yellow-500 text-lg font-semibold">{averageRating.toFixed(1)} sao</span> */}
                <span className="text-yellow-500 text-xl font-semibold">{averageRating.toFixed(1)} sao</span>
                <span className="ml-2 text-gray-500">({reviews.length} đánh giá)</span>
              </div>
             
              <div className="mt-2 text-xl">Người bán: <Link to={seller ? `/personal-product/${seller.userId}` : "#"} className="font-bold cursor-pointer hover:underline ml-1">{seller ? seller.fullName : "Thông tin người bán không có"}</Link></div>
              {categories[flower.categoryId] && (
                <p className="text-gray-600 text-xl mt-2">
                  Sự kiện: 
                  <span 
                    className="font-bold cursor-pointer hover:underline ml-1"
                    onClick={() => handleCategoryClick(categories[flower.categoryId])}
                  >
                    {categories[flower.categoryId]}
                  </span>
                 
                </p>
                
              )}
               <p className="text-gray-600 text-xl mt-2">Độ tươi: {flower.condition === 'New' ? 100 : flower.condition}%</p>
              <div className="flex mb-4"></div>
              {/* <p className="leading-relaxed">Lưu ý : Sản phẩm thực tế có thể sẽ khác đôi chút so với sản phẩm mẫu do đặc tính cắm, gói hoa thủ công. Các loại hoa không có sẵn, hoặc hết mùa sẽ được thay thế bằng các loại hoa khác, nhưng vẫn đảm bảo về định lượng hoa, tone màu, kiểu dáng và độ thẩm mỹ như sản phẩm mẫu.</p> */}
              <p className="leading-relaxed"><strong className="text-xl">Lưu ý</strong> : Sản phẩm thực tế có thể sẽ khác đôi chút so với sản phẩm mẫu do đặc tính cắm, gói hoa thủ công. Các loại hoa không có sẵn, hoặc hết mùa sẽ được thay thế bằng các loại hoa khác, nhưng vẫn đảm bảo về định lượng hoa, tone màu, kiểu dáng và độ thẩm mỹ như sản phẩm mẫu.</p>
              <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-200 mb-5">
              <div className="time-remaining text-[#bc0000] text-xl mt-2">
                {renderTimeRemaining(flower.listingDate)}
              </div>
                <div className="flex ml-6 items-center">
                  <div className="relative">
                    <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex">
                {isExpired ? ( // Kiểm tra xem sản phẩm đã hết hạn chưa
                  <span className="text-red-500 font-bold">Sản phẩm đã hết hạn</span>
                ) : (
                  <>
                    {flower.price > 0 ? ( // Kiểm tra giá trước khi hiển thị nút
                      <>
                        <button className="px-4 text-lg border-2 py-2 text-gray-800 font-bold rounded hover:bg-gray-300 transition duration-300 ease-in-out disabled:cursor-not-allowed"
                          onClick={() => setQuantity(quantity - 1)}
                          disabled={quantity <= 1}>
                          -
                        </button>
                        <span className="mt-1 mx-4 text-4xl font-semibold">{quantity}</span>
                        <button className="px-4 text-lg border-2 py-2 text-gray-800 font-bold rounded hover:bg-gray-300 transition duration-300 ease-in-out"
                          onClick={() => setQuantity(quantity + 1)}>
                          +
                        </button>
                        <button className="flex ml-2 text-lg border-2 border-0 py-2 px-6 focus:outline-none hover:bg-gray-300 rounded"
                          onClick={handleAddToCart}
                          disabled={loading}>
                          {loading ? "Đang thêm..." : "Thêm vào giỏ"}
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-500 mt-5">Vui lòng liên hệ người bán</p> 
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {seller && (
        <div className="seller-info container mx-auto mt-6 p-7 border border-gray-200 rounded shadow-sm">
          <div className="flex flex-nowrap items-center">
            <img src={seller.profileImageUrl ? `https://localhost:7288${seller.profileImageUrl}` : 'default-image-url'}
             alt={seller.name} className="w-20 h-20 rounded-full mr-2" />
            <div className="ml-2 mr-2">
              <p className="text-lg text-center">{seller.name || "Không xác đnh"}</p>
              <div className="flex mt-2">
                <button className="chat-button text-sm border border-gray-300 rounded py-2 px-3 mr-2">Chat Ngay</button>
                <button className="text-sm border border-gray-300 rounded py-1 px-2" onClick={() => navigate(`/personal-product/${seller.userId}`)}>
                  Xem Shop
                </button>
              </div>
            </div>
            <div className="mx-2 border-l h-16"></div>
            <div className="flex mt-2 ml-6">
              <div className="mr-6">
                <span>Đánh Giá: </span><strong>{seller.rating || 0}</strong>
              </div>
              <div className="mr-6">
                <span>Sản Phẩm: </span><strong>{seller.productCount || 0}</strong>
              </div>
              <div>
                <span>Người Theo Dõi: </span><strong>{seller.followers || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Reviews Section */}
      <div className="reviews-section container px-5 py-12 mx-auto">
        <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>
        {/* <p className="mb-4">Đánh giá trung bình: {averageRating.toFixed(1)} sao</p> */}
        {/* Bộ lọc đánh giá */}
        <div className="filter-section mb-6 flex items-center space-x-4">
          <span className="text-2xl font-bold text-yellow-500">{(reviews.length > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) : 0)} trên 5</span>
  
          {/* Phần hiển thị sao */}
          <div className="flex items-center">
            {Array.from({ length: Math.floor(averageRating) }, (_, index) => (
              <svg key={index} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" />
              </svg>
            ))}
            {averageRating % 1 > 0 && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                <defs>
                  <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="none" />
                  </linearGradient>
                </defs>
                <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" fill="url(#halfStar)" />
              </svg>
            )}
            {Array.from({ length: 5 - Math.ceil(averageRating) }, (_, index) => (
              <svg key={index} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" stroke="currentColor" strokeWidth="2" />
              </svg>
            ))}
          </div>
  
          {/*Filter Button */}
          <button
            onClick={() => setStarFilter(0)}
            className={`border rounded px-3 py-1 w-32 ${starFilter === 0 ? 'bg-white-500 border-red-400 text-red-400' : 'bg-white border-color'}`}
          >
            Tất cả
          </button>
          <div className="flex space-x-6">
            {starCounts.slice(1).reverse().map((count, index) => (
              <button
                key={5 - index}
                onClick={() => setStarFilter(5 - index)}
                className={`border rounded px-3 py-1 w-32 ${starFilter === 5 - index ? 'bg-white-500 border-red-400 text-red-400' : 'bg-white border-color'}`}
                >
                {5 - index} Sao ({count})
              </button>
            ))}
          </div>
        </div>
        {canReview && !userReview && (
          <form onSubmit={(e) => handleReviewSubmit(e)} className="mb-8">
            <div className="mb-4">
              <label className="block mb-2">Đánh giá:</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                className="border rounded p-2"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num} sao</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Nhận xét:</label>
              <textarea
                value={newReview.reviewComment}
                onChange={(e) => setNewReview({ ...newReview, reviewComment: e.target.value })}
                className="border rounded p-2 w-full"
                rows="4"
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Gửi đánh giá
            </button>
          </form>
        )}

        {/* Display Reviews */}
        <div className="reviews-list">
          {/* {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.reviewId} className="review-item border-b py-4">
                {editingReviewId === review.reviewId ? (
                  <form onSubmit={(e) => handleReviewSubmit(e, review.reviewId)} className="mb-4">
                    <div className="mb-2">
                      <label className="block mb-1">Đánh giá:</label> */}
                      {/* Hiển thị đánh giá của người dùng trước */}
          {userReview && (
            <div className="flex border-b py-4">
              <img
                  src={userReview.profileImageUrl ? `https://localhost:7288${userReview.profileImageUrl}` : 'default-image-url'}  
                  alt="Profile" 
                  className="w-10 h-10 rounded-full" 
                />
              <div key={userReview.reviewId} className="review-item w-full ml-3">
                <div className="flex items-center mb-2">
                  <span className="font-bold mr-2">{userReview.userName ? userReview.userName : "Người dùng ẩn danh"}</span>
                  {/* SVG Stars */}
                  <div className="flex items-center">
                    {Array.from({ length: userReview.rating }, (_, index) => (
                      <svg key={index} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                        <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" />
                      </svg>
                    ))}
                    {Array.from({ length: 5 - userReview.rating }, (_, index) => (
                      <svg key={index} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                        <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    ))}
                  </div>
                </div>
                {editingReviewId === userReview.reviewId ? (
                  <form onSubmit={(e) => handleReviewSubmit(e, userReview.reviewId)}>
                    <div className="mb-4">
                      <label className="block mb-2">Đánh giá:</label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                        // className="border rounded p-1"
                        className="border rounded p-2"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>{num} sao</option>
                        ))}
                      </select>
                    </div>
                    {/* <div className="mb-2">
                      <label className="block mb-1">Nhận xét:</label> */}
                      <div className="mb-4">
                      <label className="block mb-2">Nhận xét:</label>
                      <textarea
                        value={newReview.reviewComment}
                        onChange={(e) => setNewReview({ ...newReview, reviewComment: e.target.value })}
                        // className="border rounded p-1 w-full"
                        // rows="3"
                        className="border rounded p-2 w-full"
                        rows="4"
                      ></textarea>
                    </div>
                    {/* <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded mr-2"> */}
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                      Cập nhật
                    </button>
                    {/* <button type="button" onClick={() => setEditingReviewId(null)} className="bg-gray-300 text-black px-3 py-1 rounded"> */}
                    <button type="button" onClick={() => setEditingReviewId(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                      Hủy
                    </button>
                  </form>
                ) : (
                  <>
                    {/* <div className="flex items-center mb-2">
                      <span className="font-bold mr-2">{review.userName}</span>
                      <span>{review.rating} sao</span>
                      {review.userId === JSON.parse(localStorage.getItem("user"))?.userId && (
                        <button
                          onClick={() => handleEditReview(review.reviewId)}
                          className="ml-4 text-blue-500 hover:text-blue-700"
                        >
                          Chỉnh sửa
                        </button>
                      )} */}
                      <p>{userReview.reviewComment}</p>
                    <span className="text-sm text-gray-500">{new Date(userReview.reviewDate).toLocaleDateString()}</span>
                    <div className="mt-2">
                      <button onClick={() => handleEditReview(userReview.reviewId)} className="text-blue-500 hover:text-blue-700 mr-2">
                        Chỉnh sửa
                      </button>
                      <button onClick={() => handleDeleteReview(userReview.reviewId)} className="text-red-500 hover:text-red-700">
                        Xóa
                      </button>
                    </div>
                    {/* <p>{review.reviewComment}</p>
                    <span className="text-sm text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</span> */}
                  </>
                )}
              </div>
              </div>
          )}
          {/* Hiển thị các đánh giá khác */}
          {reviews.length > 0 ? (
            reviews.filter(review => review.userId !== JSON.parse(localStorage.getItem("user"))?.userId).map((review) => (
              <div key={review.reviewId} className="flex border-b py-4">
                <img 
                  src={review.profileImageUrl ? `https://localhost:7288${review.profileImageUrl}` : 'default-image-url'}
                  alt="Profile" 
                  className="w-10 h-10 rounded-full" 
                />
                <div className="review-item w-full ml-3">
                  <div className="flex items-center mb-2">
                    <span className="font-bold mr-2">{review.userName ? review.userName : "Người dùng ẩn danh"}</span>
                    {/* SVG Stars */}
                    <div className="flex items-center">
                      {Array.from({ length: review.rating }, (_, index) => (
                        <svg key={index} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                          <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" />
                        </svg>
                      ))}
                      {Array.from({ length: 5 - review.rating }, (_, index) => (
                        <svg key={index} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 text-yellow-500">
                          <path d="M12 .587l3.668 7.568 8.332 1.207-6.004 5.848 1.417 8.267L12 18.896l-7.413 3.895 1.417-8.267-6.004-5.848 8.332-1.207z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p>{review.reviewComment}</p>
                  <span className="text-sm text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedFlowers && relatedFlowers.length > 0 && (
        // <div className="related-products container mx-auto px-5 py-12">
        <div className="related-products container mx-auto px-5 pb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Sản phẩm liên quan</h2>
          <div className="related-products-grid overflow-x-auto">
            <div className="flex space-x-6">
              {relatedFlowers.map((relatedFlower) => (
                <Link
                  key={relatedFlower.flowerId}
                  to={`/product/${relatedFlower.flowerId}`}
                  className="related-product-item mb-2 bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform w-1/4 min-w-[200px]"
                >
                  <img
                    src={relatedFlower.imageUrl}
                    alt={relatedFlower.flowerName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2">{relatedFlower.flowerName}</h3>
                    <span className="text-sm text-[#bc0000] font-bold">{relatedFlower.price.toLocaleString()}₫</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

export default ProductDetail;