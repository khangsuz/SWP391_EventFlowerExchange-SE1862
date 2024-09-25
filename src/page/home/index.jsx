import { useEffect, useState } from "react";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";

const Home = () => {
  const [flowers, setFlowers] = useState([]);

  const fetchFlower = async () => {
    // hàm gọi API lấy dữ liệu cá koi
    try {
      const response = await api.get("product");
      setFlowers(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFlower(); // chạy thằng này mỗi khi mà trang load lên
  }, []);

  return (
    <div className="home">
      <Header />
      <div className="collection-top-bar">
        <div className="text-center collection-title mt-5">
          <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        </div>
      </div>
      <div className="home__main-content">
        {flowers.map((flower) => (
          <ProductCard flower={flower} />
          
        ))}
        <ProductCard />
        <ProductCard />
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

export default Home;
