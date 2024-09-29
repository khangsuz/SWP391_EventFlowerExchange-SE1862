import { useEffect, useState } from "react";
import Header from "../../component/header";
import "./index.scss";
import api from "../../config/axios";
import Footer from "../../component/footer";
import ProductCard from "../../component/product-card";
import { Link } from "react-router-dom";

const Home = () => {
  const [flowers, setFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]);

  const fetchFlower = async () => {
    try {
      const response = await api.get("Flowers");
      setFlowers(response.data);
      setFilteredFlowers(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchFlower = async () => {
      try {
        const response = await api.get("Flowers");
        setFlowers(response.data);
        setFilteredFlowers(response.data);
      } catch (err) {
        console.log(err);
        setFlowers([]);
        setFilteredFlowers([]);
      }
    };
  
    fetchFlower();
  }, []);

  return (
    <div className="home">
      <Header setFilteredFlowers={setFilteredFlowers} />
      <div className="landing_img">
        <img src="https://i.postimg.cc/zBvDDdsB/top-view-white-daisies.jpg" alt="" />
        <div className="landing-text mt-5">
          <h1 className="">Chào mừng đến với cửa hàng hoa của chúng tôi</h1>
          <p>Những bông hoa đẹp nhất từ các sự kiện – tái tạo vẻ đẹp trong không gian của bạn</p>
          <button type="button" className="mt-20 bg-gray-500 text-white p-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2">
            <Link to={"/products"}>Shop now</Link>
          </button>
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
                <div className="categories-content"></div>
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
                    <div className="categories-content"></div>
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
                    <div className="categories-content"></div>
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
                    <div className="categories-content"></div>
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
                    <div className="categories-content"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="section-title text-center mt-10">
        <h1 className="section-title-1">The Most Trendy</h1>
        <h3 className="section-title-3">Featured Products</h3>
        <div className="ml-10 mr-10 mb-10 flex flex-wrap">
          {filteredFlowers.map((flower) => (
            <ProductCard key={flower.flowerId} flower={flower} />
          ))}
        </div>
      </div>

      {/* Send mail for news */}
      <div className="bg-gray-100 p-10 text-center">
        <h2 className="text-3xl font-bold mb-6">SEND NEWSLETTER</h2>
        <p className="mb-9">Enter Your Email Address For Our Mailing List To Keep Your Self Update</p>
        <div className="flex justify-center">
          <input
            type="email"
            placeholder="email..."
            className="px-4 py-2 w-3/12"
          />
          <button className="bg-gray-600 text-white rounded-r-lg px-3 py-2">Subscribe</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;