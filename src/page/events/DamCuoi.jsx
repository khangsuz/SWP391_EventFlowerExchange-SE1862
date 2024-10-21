import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import { notifyError } from "../../component/alert";
import { Link } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";

function DamCuoi() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const flowersPerPage = 5;

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await api.get('/Flowers');
        const filteredFlowers = response.data.filter(flower => flower.categoryId === 4);
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

  const indexOfLastFlower = currentPage * flowersPerPage;
  const indexOfFirstFlower = indexOfLastFlower - flowersPerPage;
  const currentFlowers = flowers.slice(indexOfFirstFlower, indexOfLastFlower);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(flowers.length / flowersPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <div className="dam-cuoi container mx-auto p-20">
      <h1 className="text-2xl mb-6 font-bold text-center">Danh Sách Hoa Đám Cưới</h1>
      <div className="product-grid">
        {currentFlowers.map(flower => (
          <Link to={flower.flowerId} key={flower.flowerId} className="product-grid-item">
            <ProductCard flower={flower} />
          </Link>
        ))}
      </div>

      {/* Điều khiển phân trang */}
      {flowers.length > flowersPerPage && (
        <div className="pagination">
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`pagination-button ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default DamCuoi;
