import { useEffect, useState } from "react";
import Header from "../../component/header";
import { Button } from '@headlessui/react'
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

      <div className="landing_img">
        <img src="https://i.postimg.cc/zBvDDdsB/top-view-white-daisies.jpg" alt="" />
        <div className="landing-text mt-5">
          <h1 className="">Chào mừng đến với cửa hàng hoa của chúng tôi</h1>
          <p>Những bông hoa đẹp nhất từ các sự kiện – tái tạo vẻ đẹp trong không gian của bạn</p>
          <button type="button" class="mt-20 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">Shop now</button>
        </div>
      </div>
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

      <Footer />
    </div>
  );
};

export default Home;