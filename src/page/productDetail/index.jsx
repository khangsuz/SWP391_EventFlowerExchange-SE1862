import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../index.css";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
import ProductCard from "../../component/product-card";
import { useNavigate } from "react-router-dom";


const ProductDetail = () => {
  const navigate = useNavigate(); 
  const { updateCartItemCount } = useCart();
  const { id } = useParams();
  const [flower, setFlower] = useState(null);
  const [relatedFlowers, setRelatedFlowers] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [seller, setSeller] = useState(null); // State for seller information

  const fetchFlowerDetails = async () => {
    try {
      const response = await api.get(`Flowers/${id}`);
      setFlower(response.data);

      // Fetch seller details using userId
      if (response.data && response.data.userId) {
        const sellerResponse = await api.get(`Users/${response.data.userId}`);
        setSeller(sellerResponse.data);
      }

      if (response.data && response.data.categoryId) {
        fetchRelatedFlowers(response.data.categoryId);
      }
    } catch (err) {
      console.error("Error fetching flower details:", err);
    }
  };

  const fetchRelatedFlowers = async (categoryId) => {
    try {
      const response = await api.get(`Flowers`);
      if (response.data && Array.isArray(response.data)) {
        const related = response.data.filter(flower => flower.categoryId === categoryId && flower.flowerId !== parseInt(id));
        setRelatedFlowers(related.slice(0, 4)); // Lấy tối đa 4 sản phẩm liên quan
      }
    } catch (err) {
      console.error("Error fetching related flowers:", err);
    }
  };

  useEffect(() => {
    fetchFlowerDetails();
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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      await api.post("Orders/addtocart", null, {
        params: {
          flowerId: flower.flowerId,
          quantity: quantity,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      addToCart(flower);
      updateCartItemCount();
      alert("Thêm vào giỏ hàng thành công!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      const errorMessage = err.response?.data?.message || "Thêm vào giỏ hàng thất bại!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!flower) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="text-gray-700 body-font overflow-hidden bg-white product-detail">
        <div className="container px-5 py-24 mx-auto">
          <div className="lg:w-3/5 mx-auto flex flex-wrap">
            <img alt="ecommerce" className="lg:w-3/6 w-full object-cover object-center rounded border border-gray-200" src={flower.imageUrl} />
            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-3 lg:mt-0">
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1 mt-3">{flower.flowerName}</h1>
              <span className="title-font font-medium text-xl text-[#bc0000]">{flower.price.toLocaleString()}₫</span>
              <p className="leading-relaxed">Lưu ý: Sản phẩm thực tế có thể sẽ khác đôi chút so với sản phẩm mẫu do đặc tính cắm, gói hoa thủ công.</p>

              <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-200 mb-5">
                <button className="px-4 text-lg border-2 py-2 text-gray-800 font-bold rounded hover:bg-gray-300 transition duration-300 ease-in-out" 
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
              </div>
            </div>
          </div>

          {/* Seller Information */}
          {seller && (
            <div className="seller-info mt-6 p-4 border border-gray-200 rounded">
              
              <div className="flex items-center">
                <img src={seller.profileImageUrl} alt={seller.name} className="w-10 h-10 rounded-full mr-2" />
                <div className="ml-2">
                  <p className="text-md">{seller.name || "Không xác định"}</p>
                  <div className="flex mt-2">
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
                  <div className="flex mt-2">
                      <button className="chat-button text-sm border border-gray-300 rounded py-1 px-2 mr-2">Chat Ngay</button>
                      <button className="text-sm border border-gray-300 rounded py-1 px-2" onClick={() => navigate(`/personal-product/${seller.userId}`)}>
                      Xem Shop
                    </button>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedFlowers.length > 0 && (
        <div className="related-products container px-5 py-12 mx-auto">
          <h2 className="related-products-title text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="related-products-grid flex flex-wrap -mx-4">
            {relatedFlowers.map((relatedFlower) => (
              <div key={relatedFlower.flowerId} className="related-product-item lg:w-1/2 md:w-1/4 px-2 mb-2">
                <ProductCard flower={relatedFlower} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default ProductDetail;
