import { useEffect, useState } from "react";
import Header from "../../component/header";
import ProductCard from "../../component/product-card";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";

const Home = () => {
  const [flowers, setFlowers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      setCurrentUser(user);
    }
    // Fetch flowers
    const fetchFlower = async () => {
      try {
        const response = await api.get("Flowers");
        setFlowers(response.data);
      } catch (err) {
        console.error("Error fetching flowers:", err);
      }
    };

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
          <ProductCard key={flower.flowerId} flower={flower} buyerId={currentUser ? currentUser.userId : null} />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Home;