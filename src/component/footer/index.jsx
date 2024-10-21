import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate(); // Khởi tạo hook useNavigate

    return (
        <footer className="flex items-center bg-[rgb(250,239,226)] py-2">
            <div className="mx-auto px-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div>
                        <h2 className="mt-5 text-center text-2xl font-bold">Về chúng tôi</h2>
                        <p className="text-center mt-2 text-gray-600">
                            Bloom là nền tảng kết nối những người có nhu cầu thanh lý hoa sau sự kiện và những ai muốn tìm kiếm hoa tươi với giá ưu đãi.
                        </p>
                    </div>      
                    <div>
                        <img
                            src="https://i.postimg.cc/tCjpf50j/Black-and-Pink-Flower-Shop-Logo-1-removebg-preview.png"
                            alt="logo"
                            className="mx-auto mb-4 w-40 h-40 object-contain"
                        >
                        </img>
                        <h3 className="text-center text-lg font-bold underline cursor-pointer" onClick={() => navigate('/policy')}>
                            Chính sách và bảo mật
                        </h3>
                        <h2 className="text-center mt-2 text-lg font-bold">Cam kết của chúng tôi</h2>
                        <p className="text-center mt-2 text-gray-600">Hoa tươi đẹp, được chọn lọc kỹ càng.</p>
                        <p className="text-center mt-2 text-gray-600">Giao dịch nhanh chóng, tiện lợi.</p>
                        <p className="text-center mt-2 text-gray-600">Hỗ trợ khách hàng tận tình và chu đáo.</p>
                    </div>
                    <div>
                        <h2 className="mt-5 text-center text-2xl font-bold">Liên hệ</h2>
                        <p className="text-center mt-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 1 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            Nhà Văn Hóa Sinh Viên, Dĩ An, Bình Dương</p>
                        <p className="text-center mt-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="1 1 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                            0898.989.888</p>
                        <p className="text-center mt-2 text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="1 2 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                            Bloom@gmail.com</p>
                    </div>
                </div>
                <div className="mt-5 text-center">
                    <span>© 2023 Copyright: </span>
                    <a rel="nofollow" className="font-semibold" href='#'>Bloom</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
