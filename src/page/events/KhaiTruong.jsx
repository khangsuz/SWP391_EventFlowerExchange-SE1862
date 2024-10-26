import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import { notifyError } from "../../component/alert";
import { Link } from "react-router-dom";
import LoadingComponent from '../../component/loading'; 

function KhaiTruong() { 
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [flowersPerPage] = useState(12);

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await api.get('/Flowers');
        const filteredFlowers = response.data.filter(flower => flower.categoryId === 3);
        setFlowers(filteredFlowers);
      } catch (error) {
        console.error("Error fetching flowers:", error);
        notifyError("Không thể tải danh sách hoa.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, []);

  if (loading) {
    return <LoadingComponent />; // Show loading component
  }

  const indexOfLastFlower = currentPage * flowersPerPage;
  const indexOfFirstFlower = indexOfLastFlower - flowersPerPage;
  const currentFlowers = flowers.slice(indexOfFirstFlower, indexOfLastFlower);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(flowers.length / flowersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="khai-truong container mx-auto p-20"> {/* Cập nhật className nếu cần */}
      <h1 className="text-2xl mb-6 font-bold text-center">Danh Sách Hoa Khai Trương</h1> {/* Cập nhật tiêu đề */}
      <div className="grid grid-cols-4 gap-4">
        {currentFlowers.map(flower => (
          <Link to={flower.flowerId} key={flower.flowerId} className="product-grid-item">
            <ProductCard flower={flower} />
          </Link>
        ))}
      </div>

      {flowers.length > flowersPerPage && (
        <div className="flex justify-center my-8">
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`mx-1 px-4 py-2 border ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300'} transition-all duration-300`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default KhaiTruong; // Đổi tên xuất khẩu thành KhaiTruong