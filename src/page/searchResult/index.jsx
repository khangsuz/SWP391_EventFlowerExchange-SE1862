import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import Header from "../../component/header";
import Footer from "../../component/footer";
import { Notification, notifySuccess, notifyError } from "../../component/alert";

function SearchResult() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    setSearchQuery(query);

    if (query) {
      setProducts([]);
      const fetchProducts = async () => {
        setLoading(true);
        setError(null); 
        try {
          console.log("Fetching products with query:", query);
          const response = await api.get("Flowers/searchbyname", {
            params: { name: query }, 
          });
          console.log("API Response:", response.data); 

          const productData = response.data.products || response.data; 
          console.log("Product Data:", productData);

          setProducts(Array.isArray(productData) ? productData : []);
        } catch (error) {
          console.error("Error fetching products:", error);
          // if (error.response) {
          //   console.error("Response data:", error.response.data);
          //   console.error("Response status:", error.response.status);
          //   setError(error.response.data.message || "An error occurred.");
          // } else if (error.request) {
          //   console.error("Request data:", error.request);
          //   setError("No response from server.");
          // } else {
          //   console.error("Error message:", error.message);
          //   setError("An error occurred.");
          // }
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    } else {
      setLoading(false); 
    }
  }, [location.search]);

  return (
    <>
    <Notification />
      <Header />
      {/* <div className="search-result-page container mx-auto px-4 py-8">
        <h2 className="text-center text-2xl font-bold mb-6">Kết quả tìm kiếm cho "{searchQuery}."</h2> */}
        <div className="search-result-page container mx-auto p-20">
        <h1 className="text-3xl mb-6 font-bold text-center">Tìm Kiếm</h1>
        <h2 className="text-center text-2xl font- mb-6">Kết quả tìm kiếm cho "<strong>{searchQuery}</strong>"</h2>
        {loading ? (
          <p>Đang tải kết quả...</p>
        ) : (
          <>
            {/* <p className="text-center text-lg font-medium mb-4">{products.length} sản phẩm được tìm thấy</p>
            <div className="product-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.flowerId} className="product-grid-item">
                    <ProductCard flower={product} />
                  </div>
                ))
              ) : (
                <p>Không có sản phẩm nào được tìm thấy.</p>
              )}
            </div> */}
            {products.length > 0 ? (
              <>
                <p className="text-center text-lg font-medium mb-6">{products.length} sản phẩm được tìm thấy</p>
                <div className="product-grid">
                  {products.map((product) => (
                    <div key={product.flowerId} className="product-grid-item">
                      <ProductCard flower={product} />
                </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-lg text-center font-medium mb-6">Không có sản phẩm nào được tìm thấy.</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SearchResult;
