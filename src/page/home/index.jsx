import { useEffect, useState } from "react";
import Header from "../../component/header";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";
import ProductCard from "../../component/product-card";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    fetchFlower();
  }, []);

  return (
    <div className="home">
      <Header />
      <div className="landing_img">
        <img src="https://i.postimg.cc/zBvDDdsB/top-view-white-daisies.jpg" alt="" />
        <div className="landing-text mt-5">
          <h1 className="">Chào mừng đến với cửa hàng hoa của chúng tôi</h1>
          <p>Những bông hoa đẹp nhất từ các sự kiện – tái tạo vẻ đẹp trong không gian của bạn</p>
          <button type="button" className="mt-20 bg-gray-500 text-white p-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"><Link to={"/products"}>Shop now</Link></button>
        </div>
      </div>

      {/* Categories pics */}
      <div className="categories-area pt-10">
        <div className="ml-12">
          <div className="flex flex-wrap">
            <div className="cat-1 w-full md:w-1/3 px-4">
              <div className="categories-img mb-8">
                <a href="#">
                  <img
                    src="https://template.hasthemes.com/flosun/flosun/assets/images/category/home1-category-1.jpg"
                    alt=""
                    className="mt-11 flex item-align w-full h-auto"
                  />

                </a>
                <div className="categories-content">
                </div>
              </div>
            </div>
            <div className="cat-2 w-full md:w-2/3 px-2">
              <div className="flex flex-wrap">
                <div className="cat-3 w-full md:w-6/12 px-4">
                  <div className="categories-img mb-8">
                    <a href="#">
                      <img
                        src="https://template.hasthemes.com/flosun/flosun/assets/images/category/home1-category-2.jpg"
                        alt=""
                        className="w-full h-auto"
                      />
                    </a>
                    <div className="categories-content">
                    </div>
                  </div>
                </div>
                <div className="cat-4 w-full md:w-5/12 px-4">
                  <div className="categories-img mb-8">
                    <a href="#">
                      <img
                        src="https://template.hasthemes.com/flosun/flosun/assets/images/category/home1-category-3.jpg"
                        alt=""
                        className="w-full h-auto"
                      />
                    </a>
                    <div className="categories-content">
                    </div>
                  </div>
                </div>
                <div className="cat-5 w-full md:w-1/3 px-4">
                  <div className="categories-img mb-8">
                    <a href="#">
                      <img
                        src="https://template.hasthemes.com/flosun/flosun/assets/images/category/home1-category-4.jpg"
                        alt=""
                        className="w-full h-auto"
                      />
                    </a>
                    <div className="categories-content">
                    </div>
                  </div>
                </div>
                <div className="cat-6 w-full md:w-7/12 px-4">
                  <div className="categories-img mb-8">
                    <a href="#">
                      <img
                        src="https://template.hasthemes.com/flosun/flosun/assets/images/category/home1-category-5.jpg"
                        alt=""
                        className="w-full h-auto"
                      />
                    </a>
                    <div className="categories-content">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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