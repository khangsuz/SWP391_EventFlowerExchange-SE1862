import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../../component/product-card";
import { notifyError } from "../../component/alert";

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
    <div className="dam-cuoi">
      <h1>Danh Sách Hoa Cưới</h1>
      <div className="product-list">
        {flowers.map(flower => (
          <ProductCard key={flower.flowerId} flower={flower} />
        ))}
      </div>
    </div>
  );
}

export default DamCuoi;