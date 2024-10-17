import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { Table, Modal, Input } from "antd";
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
import { FaArrowLeft, FaMoneyCheckAlt } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const ManageRevenue = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Các state để lưu thông tin rút tiền
  const [withdrawRequest, setWithdrawRequest] = useState({
    accountNumber: '',
    fullName: '',
    phone: '',
    amount: 0,
    remarks: '', // Thêm trường Remarks
  });

  const fetchRevenue = async () => {
    try {
      const response = await api.get(`Users/revenue/${userId}`);
      setRevenue(response.data.total);
      setRevenueData(response.data.details || []);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [userId]);

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

  const handleWithdraw = async () => {
    if (withdrawRequest.amount > revenue) {
      alert('Số tiền rút không được lớn hơn doanh thu thu được.');
      return; // Dừng thực hiện nếu điều kiện không thỏa mãn
    }
    try {
      const response = await api.post('Users/api/withdrawal', withdrawRequest);
      console.log("Withdraw Response:", response.data);
      alert('Yêu cầu rút tiền đã được gửi!');
      setIsModalVisible(false);
      fetchRevenue(); // Cập nhật lại doanh thu sau khi rút tiền
    } catch (error) {
      console.error("Error during withdrawal:", error);
      alert('Rút tiền không thành công!');
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawRequest({ ...withdrawRequest, [name]: value });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <span className="mr-2">📊</span>Quản Lý Doanh Thu
        </h1>
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-600">Tổng Doanh Thu: {revenue} VNĐ</h2>

        <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
          <div className="mb-6">
            <div className="text-center mb-4">
              <button 
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out transform hover:bg-blue-500 hover:scale-105 shadow-md hover:shadow-lg"
                onClick={() => navigate(`/personal-product/${userId}`)} 
              >
                <FaArrowLeft className="inline-block mr-2" /> Quay Về Cửa Hàng
              </button>
            </div>

            <div className="text-center">
              <button 
                className="bg-green-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out transform hover:bg-green-500 hover:scale-105 shadow-md hover:shadow-lg"
                onClick={showModal} // Hiện modal khi bấm nút rút tiền
              >
                <FaMoneyCheckAlt className="inline-block mr-2" /> Rút Tiền
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

      {/* Modal để nhập thông tin rút tiền */}
      <Modal
        title="Thông Tin Rút Tiền"
        visible={isModalVisible}
        onOk={handleWithdraw}
        onCancel={handleCancel}
        okText="Xác Nhận"
        cancelText="Hủy"
      >
        <p>Số tài khoản:</p>
        <Input
          name="accountNumber"
          value={withdrawRequest.accountNumber}
          onChange={handleInputChange}
        />
        <p>Họ tên:</p>
        <Input
          name="fullName"
          value={withdrawRequest.fullName}
          onChange={handleInputChange}
        />
        <p>Số điện thoại:</p>
        <Input
          name="phone"
          value={withdrawRequest.phone}
          onChange={handleInputChange}
        />
        <p>Số tiền:</p>
        <Input
          type="number"
          name="amount"
          value={withdrawRequest.amount}
          onChange={handleInputChange}
        />
        <p>Ghi chú (không bắt buộc):</p>
        <Input
          name="remarks"
          value={withdrawRequest.remarks}
          onChange={handleInputChange}
        />
      </Modal>

      <Footer />
    </>
  );
};

export default ManageRevenue;
