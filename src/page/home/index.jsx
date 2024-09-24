import { useEffect, useState } from "react";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";

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

      <div className="home__main-content">
        {/* cứ mỗi con cá => <ProductCard /> */}
        {flowers.map((flower) => (
          <ProductCard flower={flower} />
        ))}
      </div>
    </div>
  );
};

export default Home;
