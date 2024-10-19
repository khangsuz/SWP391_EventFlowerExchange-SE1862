import "../../index.css";
import React from 'react';
import Header from "../../component/header";
import Footer from "../../component/footer";
const About = () => {
  return (
    <>
    <Header />
    <div className="bg-white text-gray-800 p-20">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold">GIỚI THIỆU</h1>
        <p className="text-base mt-4 text-lg">
          Tại Bloom, chúng tôi tin rằng vẻ đẹp của hoa không chỉ dừng lại ở một sự kiện. Chúng tôi là điểm đến
          độc đáo cho những người yêu hoa, mang đến cơ hội sở hữu những bông hoa tuyệt đẹp với giá cả phải chăng sau các sự kiện lớn.
        </p>
      </header>

      {/* Our Story */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Câu chuyện của chúng tôi</h2>
        <p className="text-lg">
          <strong>Bloom</strong> ra đời từ ý tưởng đơn giản: tại sao những bông hoa xinh đẹp lại bị lãng phí sau khi sự kiện kết thúc?
          Chúng tôi quyết định tạo ra một giải pháp bền vững, kết nối những bông hoa này với những người yêu hoa, mang lại
          niềm vui và sắc màu cho cuộc sống hàng ngày.
        </p>
      </section>

      {/* What Makes Us Different */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Điều gì làm nên sự khác biệt của Bloom?</h2>
        <ul className="list-disc list-inside text-lg">
          <li><strong>Bền vững:</strong> Chúng tôi giảm thiểu lãng phí bằng cách tái sử dụng hoa từ các sự kiện.</li>
          <li><strong>Giá cả hợp lý:</strong> Bạn có thể sở hữu những bông hoa chất lượng cao với giá thấp hơn so với thị trường.</li>
          <li><strong>Đa dạng:</strong> Từ hoa cưới đến hoa trang trí sự kiện công ty, chúng tôi có đủ loại để bạn lựa chọn.</li>
          <li><strong>Trải nghiệm độc đáo:</strong> Mỗi bó hoa đều mang theo câu chuyện riêng từ sự kiện nó đã tham gia.</li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Cách thức hoạt động</h2>
        <ol className="list-decimal list-inside text-lg">
          <li>Chúng tôi thu gom hoa sau các sự kiện lớn.</li>
          <li>Hoa được chọn lọc cẩn thận và làm tươi lại.</li>
          <li>Bạn duyệt qua danh mục và chọn bó hoa ưng ý.</li>
          <li>Chúng tôi giao hoa tận nơi cho bạn trong thời gian ngắn nhất.</li>
        </ol>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default About;
