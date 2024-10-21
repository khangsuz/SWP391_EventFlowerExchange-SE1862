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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <Header />
    <div className="dam-cuoi container mx-auto p-20">
      <h1 className="text-3xl mb-6 font-bold text-center">Danh Sách Hoa Đám Cưới</h1>
      <div className="product-grid">
        {flowers.map(flower => (
          <Link to={flower.flowerId} key={flower.flowerId} className="product-grid-item"> {/* Thêm Link */}
            <ProductCard flower={flower} />
          </Link>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
}

export default DamCuoi;