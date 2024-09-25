import { useEffect, useState } from "react";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";

const Home = () => {
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
    <div className="home">
      <Header />
      <div className="collection-top-bar">
        <div className="text-center collection-title mt-5">
          <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
        </div>
      </div>
      <div className="home__main-content">
        {flowers.map((flower) => (
<<<<<<< HEAD
          <ProductCard key={flower.flowerId} flower={flower} />
        ))}
=======
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
>>>>>>> 81dd22a391d8e8b6d08ed6aba4d1d212e0e7280f
      </div>
      <Footer />
    </div>
  );
};

export default Home;