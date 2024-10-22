import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { Table, Modal, Input, Button } from "antd";
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
  const [currentIncome, setCurrentIncome] = useState(0); 
  const [totalWithdrawn, setTotalWithdrawn] = useState(0); 
  const [commission, setCommission] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]); 
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);


  const handleCancelRequest = async (requestId) => {
    if (!requestId) {
      alert('Yêu cầu không hợp lệ!');
      return;
    }
    
    try {
      await api.delete(`Users/api/withdrawal-requests/${requestId}`); 
      alert('Yêu cầu rút tiền đã được hủy!');
      fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error canceling withdrawal request:", error);
      alert('Hủy yêu cầu không thành công!');
    }
  };
  const showHistoryModal = () => {
    setIsHistoryModalVisible(true); 
  };

  const handleHistoryCancel = () => {
    setIsHistoryModalVisible(false); 
  };
  const fetchWithdrawalRequests = async () => {
    try {
      const response = await api.get(`Users/api/withdrawal-requests/${userId}`); 
      setWithdrawalRequests(response.data); 
    } catch (err) {
      console.error("Error fetching withdrawal requests:", err);
    }
  };
  const fetchCurrentUserId = async () => {
    try {
      const response = await api.get('/Users/current-user'); 
      setCurrentUserId(response.data.userId);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId && currentUserId !== parseInt(userId)) {
      navigate(`/manage-revenue/${currentUserId}`); 
    }
  }, [currentUserId, userId, navigate]);

  const [withdrawRequest, setWithdrawRequest] = useState({
    accountNumber: '',
    fullName: '',
    phone: '',
    amount: 0,
    remarks: '', 
  });

  const fetchRevenue = async () => {
    try {
        const response = await api.get(`Users/revenue/${userId}`);
        console.log("Revenue Response:", response.data); 
        setRevenue(response.data.totalRevenue); 
        setRevenueData(response.data.details || []);
    } catch (err) {
        console.error("Error fetching revenue:", err);
    }
};

  const fetchCurrentIncome = async () => {
    try {
      const response = await api.get(`Users/api/users/${userId}/revenue`); 
      setCurrentIncome(response.data.currentIncome); 
      setTotalWithdrawn(response.data.totalWithdrawn); 
      setCommission(response.data.commission); 
    } catch (err) {
      console.error("Error fetching current income:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
    fetchCurrentIncome(); 
    fetchWithdrawalRequests();
  }, [userId]);

  const chartData = {
    labels: revenueData.map(item => item.date),
    datasets: [
      {
        label: 'Doanh Thu',
        data: revenueData.map(item => item.amount),
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
      return; 
    }
    
    try {
      const response = await api.post('Users/api/withdrawal', withdrawRequest);
      console.log("Withdraw Response:", response.data);
      alert('Yêu cầu rút tiền đã được gửi!');
      setIsModalVisible(false);
      fetchRevenue(); 
      fetchCurrentIncome(); 
      fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error during withdrawal:", error);
      alert('Rút tiền không thành công!');
    }
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawRequest({ ...withdrawRequest, [name]: value });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
          <span className="mr-2">📊</span>Quản Lý Doanh Thu
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold">Tổng Doanh Thu</h2>
            <p className="text-xl text-green-600">{revenue !== undefined ? revenue.toLocaleString() : '0'} VNĐ</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold">Thu Nhập Hiện Tại</h2>
            <p className="text-xl text-blue-600">{currentIncome ? currentIncome.toLocaleString() : '0'} VNĐ</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold">Tổng Số Tiền Đã Rút</h2>
            <p className="text-xl text-red-600">{totalWithdrawn ? totalWithdrawn.toLocaleString() : '0'} VNĐ</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold">Hoa Hồng</h2>
            <p className="text-xl text-purple-600">{commission ? commission.toLocaleString() : '0'} VNĐ</p> {/* Hiển thị hoa hồng */}
          </div>
        </div>

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
                onClick={showModal} 
              >
                <FaMoneyCheckAlt className="inline-block mr-2" /> Rút Tiền
              </button>
              <Button 
                className="bg-yellow-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out transform hover:bg-yellow-500 hover:scale-105 shadow-md hover:shadow-lg ml-4"
                onClick={showHistoryModal} 
              >
                Lịch Sử Yêu Cầu Rút Tiền
              </Button>
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
              { title: 'Ngày', dataIndex: 'date', key: 'date', render: (text) => text || 'Không có ngày' },
              { title: 'Doanh Thu', dataIndex: 'amount', key: 'amount', render: (text) => `${(text || 0).toLocaleString()} VNĐ` },
            ]}
            rowKey="date"
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
      {/* Modal để hiển thị lịch sử yêu cầu rút tiền */}
      <Modal
        title="Lịch Sử Yêu Cầu Rút Tiền"
        visible={isHistoryModalVisible}
        onCancel={handleHistoryCancel}
        footer={null} 
        width={1000}
      >
        <Table
            dataSource={withdrawalRequests}
            columns={[
              { title: 'Số Tài Khoản', dataIndex: 'accountNumber', key: 'accountNumber' },
              { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
              { title: 'Số Điện Thoại', dataIndex: 'phone', key: 'phone' },
              { title: 'Số Tiền', dataIndex: 'amount', key: 'amount', render: (text) => `${(text || 0).toLocaleString()} VNĐ` },
              { title: 'Trạng Thái', dataIndex: 'status', key: 'status', render: (text) => text || 'Chờ Xử Lý' },
              { title: 'Ghi Chú', dataIndex: 'remarks', key: 'remarks' },
              { title: 'Ngày Yêu Cầu', dataIndex: 'requestDate', key: 'requestDate', render: (text) => text ? new Date(text).toLocaleDateString() : 'Không có ngày' },
              {
                title: 'Hành Động',
                key: 'action',
                render: (text, record) => (
                    record.status !== "Approved" ? ( // Kiểm tra trạng thái
                            <Button 
                                type="danger" 
                                onClick={() => handleCancelRequest(record.requestId)}
                            >
                                Hủy
                            </Button>
                        ) : null // Không hiển thị nút nếu đã được duyệt
                    ),
                },
            ]}
            rowKey="requestDate" 
            pagination={false}
            bordered
            className="bg-gray-100"
          />
      </Modal>

      <Footer />
    </>
  );
};

export default ManageRevenue;