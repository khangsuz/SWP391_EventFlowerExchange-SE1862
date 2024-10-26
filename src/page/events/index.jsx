import React from "react";
import { useNavigate, Route, Routes } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import DamCuoi from "./DamCuoi";
import SinhNhat from "./SinhNhat";
import KiNiem from "./KiNiem";
import KhaiTruong from "./KhaiTruong";
import ChucMung from "./ChucMung";

function Events() {
  const navigate = useNavigate();

  const eventTypes = [
    {
      name: "Hoa Sinh Nhật",
      image: "https://hoatuoiquan7.com/upload/sanpham/hoa-bo-20-bong-hong-do-dep-7050.jpg",
      path: "/events/hoa-sinh-nhat"
    },
    {
      name: "Hoa Khai Trương",
      image: "https://shophoa365.com/wp-content/uploads/2020/06/ba4a2600f7d60a8853c720-min.jpg",
      path: "/events/hoa-khai-truong"
    },
    {
      name: "Hoa Đám Cưới",
      image: "https://tonywedding.vn/wp-content/uploads/2022/11/3.jpg",
      path: "/events/hoa-dam-cuoi"
    },
    {
      name: "Hoa Kỉ Niệm",
      image: "https://hoatuoi9x.com/wp-content/uploads/2022/04/0000203_bo-hoa-huong-duong-hb22.jpeg",
      path: "/events/hoa-Ki-Niem"
    },
    {
      name: "Hoa Chúc Mừng",
      image: "https://shophoa365.com/wp-content/uploads/2022/07/Untitled-design-2022-07-20T235416.654-min-768x1024.png",
      path: "/events/hoa-chuc-mung"
    }

  ];

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <div className="flower-events container pt-20 pb-20 mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Hoa sự kiện</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1">
              {eventTypes.map((event, index) => (
                <div key={index} className="event-form">
                  <img 
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    onClick={() => navigate(event.path)}
                  />
                  <h2 className="text-lg text-center font-normal bg-gray-200 p-1" onClick={() => navigate(event.path)}>{event.name}</h2>
                </div>
              ))}
            </div>
          </div>
        } />
        <Route path="/hoa-sinh-nhat" element={<SinhNhat />} />
        <Route path="/hoa-khai-truong" element={<KhaiTruong />} />
        <Route path="/hoa-dam-cuoi" element={<DamCuoi />} />
        <Route path="/hoa-ki-niem" element={<KiNiem />} />
        <Route path="/hoa-chuc-mung" element={<ChucMung />} />
      </Routes>
      <Footer />
    </>
  );
}

export default Events;