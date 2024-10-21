import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import Header from "../../component/header";
import Footer from "../../component/footer";
import { Notification } from "../../component/alert";
import LoadingComponent from '../../component/loading'; // Import LoadingComponent

function SearchResult() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    setSearchQuery(query);

    if (query) {
      setProducts([]);
      const fetchProducts = async () => {
        setLoading(true);
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
      <div className="search-result-page container mx-auto p-20">
        <h1 className="text-3xl mb-6 font-bold text-center">Tìm Kiếm</h1>
        <h2 className="text-center text-2xl font- mb-6">Kết quả tìm kiếm cho "<strong>{searchQuery}</strong>"</h2>
        {loading ? (
          <LoadingComponent /> // Show loading component
        ) : (
          <>
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
              <p className="text-lg text-center mb-6">Không có sản phẩm nào được tìm thấy.</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SearchResult;
