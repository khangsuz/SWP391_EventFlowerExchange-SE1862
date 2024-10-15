import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import api from "../../config/axios";
import { Table } from "antd";
import { Line } from 'react-chartjs-2'; 
import Header from "../../component/header";
import Footer from "../../component/footer";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaArrowLeft } from 'react-icons/fa'; // Import icon

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const ManageRevenue = () => {
  const { userId } = useParams();
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [revenue, setRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState([]);

  const fetchRevenue = async () => {
    try {
      console.log(`Fetching revenue for userId: ${userId}`);
      const response = await api.get(`Users/revenue/${userId}`);
      console.log("API Response:", response.data);

      setRevenue(response.data.total);
      setRevenueData(response.data.details || []);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [userId]);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: revenueData.map(item => item.month || 'Không có tháng'),
    datasets: [
      {
        label: 'Doanh Thu',
        data: revenueData.map(item => item.amount || 0),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.3,
      }
    ]
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <span className="mr-2">📊</span>Quản Lý Doanh Thu
        </h1>
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-600">Tổng Doanh Thu: {revenue} VNĐ</h2>

        {/* Thẻ hiển thị thông tin doanh thu */}
        <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
          <div className="mb-6">
            {/* Nút quay lại */}
            <div className="text-center">
              <button 
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out transform hover:bg-blue-500 hover:scale-105 shadow-md hover:shadow-lg"
                onClick={() => navigate(`/personal-product/${userId}`)} 
              >
                <FaArrowLeft className="inline-block mr-2" /> Quay Về Cửa Hàng
              </button>
            </div>
          </div>

          {/* Biểu đồ doanh thu */}
          <div className="mb-8">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      font: {
                        size: 14,
                        family: 'Arial',
                        weight: 'bold',
                      },
                      color: '#333',
                    }
                  },
                  tooltip: {
                    backgroundColor: '#fff',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    titleColor: '#333',
                    bodyColor: '#333',
                    titleFont: {
                      weight: 'bold',
                    },
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Tháng',
                      font: {
                        size: 16,
                        weight: 'bold',
                      },
                      color: '#333',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Doanh Thu (VNĐ)',
                      font: {
                        size: 16,
                        weight: 'bold',
                      },
                      color: '#333',
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          {/* Bảng doanh thu */}
          <Table
            dataSource={revenueData}
            columns={[
              { title: 'Tháng', dataIndex: 'month', key: 'month', render: (text) => text || 'Không có tháng' },
              { title: 'Doanh Thu', dataIndex: 'amount', key: 'amount', render: (text) => `${text || 0} VNĐ` },
            ]}
            rowKey="month"
            pagination={false}
            bordered
            className="bg-gray-100"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageRevenue;
