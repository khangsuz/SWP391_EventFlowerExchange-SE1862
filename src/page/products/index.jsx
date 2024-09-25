import { useEffect, useState } from "react";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";

const Products = () => {
  const [flowers, setFlowers] = useState([]);
  const fetchFlower = async () => {
    try {
      const response = await api.get("Flowers");
      setFlowers(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFlower();
  }, []);

  return (
    <div className="products__main">
      <Header />
      <div className="collection-top-bar">
        <div className="text-center collection-title mt-7">
          <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        </div>
      </div>
      <div className="home__main-content">
        {/* {flowers.map((flower) => (
          <ProductCard key={flower.flowerId} flower={flower} />
        ))} */}
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        
      </div>
      <Footer />
    </div>
  );
};

export default Products;