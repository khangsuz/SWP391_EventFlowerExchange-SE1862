import React from 'react';

const Footer = () => {
    return (
        <footer className="flex items-center bg-[#f9f5ec] py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div>
                        <h2 className="text-center text-lg font-bold">Về chúng tôi</h2>
                        <p className="text-center mt-2 text-gray-600">
                            Bloom là nền tảng kết nối những người có nhu cầu thanh lý hoa sau sự kiện và những ai muốn tìm kiếm hoa tươi với giá ưu đãi.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-center text-lg font-bold">Cam kết của chúng tôi</h2>
                        <p className="text-center mt-2 text-gray-600">Hoa tươi đẹp, được chọn lọc kỹ càng.</p>
                        <p className="text-center mt-2 text-gray-600">Giao dịch nhanh chóng, tiện lợi.</p>
                        <p className="text-center mt-2 text-gray-600">Hỗ trợ khách hàng tận tình và chu đáo.</p>
                    </div>
                    <div>
                        <h2 className="text-center text-lg font-bold">Liên hệ</h2>
                        <p className="text-center mt-2 text-gray-600">Địa chỉ: Nhà Văn Hóa Sinh Viên, Dĩ An, Bình Dương</p>
                        <p className="text-center mt-2 text-gray-600">Điện thoại: 0898.989.888</p>
                        <p className="text-center mt-2 text-gray-600">Email: EventFlowerExchange@gmail.com</p>
                    </div>
                </div>
                <div className="mt-10 text-center">
                    <span>© 2023 Copyright: </span>
                    <a rel="nofollow" className="font-semibold" href='#'>Bloom</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;