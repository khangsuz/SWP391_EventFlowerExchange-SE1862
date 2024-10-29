import React from "react";
import { useNavigate, Route, Routes } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";

function Events() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <Header />
      <div className="flower-events container pt-20 pb-20 mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Hoa sự kiện</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          <div className="event-form">
            <img 
              src="https://hoatuoiquan7.com/upload/sanpham/hoa-bo-20-bong-hong-do-dep-7050.jpg" 
              alt="Bản Giao Hưởng Sắc Hoa" 
              className="w-full h-full object-cover"
              onClick={() => handleNavigate('/hoa-sinh-nhat')}
            />
            <h2 className="text-lg text-center font-normal bg-gray-200 p-1">Hoa Sinh Nhật</h2>
          </div>
          <div className="event-form">
            <img 
              src="https://lovearts.vn/wp-content/uploads/2023/07/Hoa-van-phong-dep34.jpg" 
              alt="Miền Nhiệt Đới Blue Forest" 
              className="w-full h-full object-cover"
              onClick={() => handleNavigate('/hoa-van-phong')}
            />
            <h2 className="text-lg text-center font-normal bg-gray-200 p-1">Hoa Văn Phòng</h2>
          </div>
          <div className="event-form">
            <img 
              src="https://tonywedding.vn/wp-content/uploads/2022/11/3.jpg" 
              alt="Bữa Tiệc Mùa Thu" 
              className="w-full h-full object-cover"
              onClick={() => handleNavigate('/hoa-dam-cuoi')}
            />
            <h2 className="text-lg text-center font-normal bg-gray-200 p-1">Hoa Đám Cưới</h2>
          </div>
          <div className="event-form">
            <img 
              src="https://hoatuoi9x.com/wp-content/uploads/2022/04/0000203_bo-hoa-huong-duong-hb22.jpeg" 
              alt="Hoa Thiên Nhiên" 
              className="w-full h-full object-cover"
              onClick={() => handleNavigate('/hoa-thien-nhien')}

            />
            <h2 className="text-lg text-center font-normal bg-gray-200 p-1">Hoa Thiên Nhiên</h2>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Events;