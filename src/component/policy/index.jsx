import React from 'react';
import Header from '../header';
import Footer from '../footer';
const Policy = () => {
  return (
    <>
    <Header />
    <div className="policy-container p-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Chính sách và quy định</h1>

      <section className="mb-8 p-4">
        <h2 className="text-2xl font-semibold mb-3 text-red-500">1. Chính sách bảo mật</h2>
        <p className="text-gray-600">
          Chúng tôi cam kết bảo vệ quyền riêng tư của khách hàng. Thông tin cá nhân mà bạn cung cấp khi sử dụng dịch vụ
          thanh lý hoa sau sự kiện sẽ chỉ được sử dụng cho mục đích xử lý đơn hàng, hỗ trợ khách hàng, và cải thiện trải
          nghiệm người dùng. Thông tin của bạn sẽ không được chia sẻ với bất kỳ bên thứ ba nào trừ khi có sự đồng ý từ bạn
          hoặc khi luật pháp yêu cầu.
        </p>
      </section>

      <section className="mb-8 p-4">
        <h2 className="text-2xl font-semibold mb-3 text-red-500">2. Điều khoản và điều kiện</h2>
        <ul className="list-disc ml-6 text-gray-600">
          <li>
            Khi đặt mua hoa trên nền tảng, khách hàng cần đảm bảo cung cấp thông tin chính xác về địa chỉ nhận hàng và
            thông tin liên hệ.
          </li>
          <li>
            Các giao dịch mua bán hoa sau sự kiện đều không thể hoàn lại tiền sau khi đơn hàng đã được xử lý.
          </li>
          <li>
            Hoa thanh lý có thể là hoa đã qua sự kiện và có mức giá giảm so với giá trị ban đầu, do đó một số sản phẩm có
            thể không ở trạng thái hoàn hảo. Khách hàng cần hiểu rõ và chấp nhận tình trạng của sản phẩm trước khi mua.
          </li>
        </ul>
      </section>

      <section className="mb-8 p-4">
        <h2 className="text-2xl font-semibold mb-3 text-red-500">3. Chính sách hoàn trả và đổi trả</h2>
        <p className="text-gray-600">
          Do đặc thù của sản phẩm hoa tươi sau sự kiện, chúng tôi không áp dụng chính sách đổi trả. Tuy nhiên, nếu có bất kỳ
          sự cố nào liên quan đến đơn hàng <strong>(sai sản phẩm, hư hỏng nghiêm trọng ngoài dự kiến)</strong>, khách hàng có thể liên hệ với
          chúng tôi trong vòng 24 giờ sau khi nhận hàng để được hỗ trợ.
        </p>
      </section>

      <section className="mb-8 p-4">
        <h2 className="text-2xl font-semibold mb-3 text-red-500">4. Chính sách giao hàng</h2>
        <p className="text-gray-600">
          Giao hàng chỉ được áp dụng trong khu vực Hồ Chí Minh và sẽ được tính phí dựa trên khoảng cách từ địa điểm của sự
          kiện đến địa chỉ nhận hàng. Thời gian giao hàng dự kiến là trong vòng 1-2 ngày kể từ khi đặt hàng. Chúng tôi không
          cam kết giao hàng đúng thời điểm cụ thể nhưng sẽ nỗ lực để giao hàng nhanh nhất có thể.
        </p>
      </section>

      <section className="mb-8 p-4">
        <h2 className="text-2xl font-semibold mb-3 text-red-500">5. Chính sách thanh toán</h2>
        <p className="text-gray-600">
          Chúng tôi chấp nhận thanh toán qua các phương thức VNPay. Tất cả
          giao dịch thanh toán đều phải được hoàn tất trước khi giao hàng.
        </p>
      </section>

      <section className="mb-8 p-4">
        <h2 className="text-2xl font-semibold mb-3 text-red-500">6. Chính sách bảo hành</h2>
        <p className="text-gray-600">
          Vì sản phẩm là hoa tươi, chúng tôi không cung cấp bảo hành cho sản phẩm. Tuy nhiên, nếu có bất kỳ vấn đề nào liên
          quan đến chất lượng hoa không như mô tả, vui lòng liên hệ với chúng tôi ngay lập tức để được giải quyết.
        </p>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Policy;
