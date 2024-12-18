import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { Table, Modal, Input, Button, message, Form } from "antd";
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

  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
  const validationRules = {
    accountNumber: [
      { required: true, message: 'Vui lòng nhập số tài khoản!' },
      { pattern: /^\d+$/, message: 'Số tài khoản chỉ được chứa số!' },
      { min: 8, message: 'Số tài khoản phải có ít nhất 8 số!' }
    ],
    fullName: [
      { required: true, message: 'Vui lòng nhập họ tên chủ tài khoản!' },
      { min: 5, message: 'Họ tên phải có ít nhất 5 ký tự!' }
    ],
    phone: [
      { required: true, message: 'Vui lòng nhập số điện thoại!' },
      { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
    ],
    amount: [
      { required: true, message: 'Vui lòng nhập số tiền cần rút!' },
      { 
        validator: async (_, value) => {
          const numericValue = Number(value?.replace(/[^0-9]/g, ''));
          if (numericValue < 100000) {
            throw new Error('Số tiền rút tối thiểu là 100,000 VNĐ!');
          }
          if (numericValue > currentIncome) {
            throw new Error('Số tiền rút không được lớn hơn số dư hiện tại!');
          }
        }
      }
    ]
  };

  const handleCancelRequest = async (requestId) => {
    if (!requestId) {
      message.error('Yêu cầu không hợp lệ!');
      return;
    }
    
    try {
      await api.delete(`Users/api/withdrawal-requests/${requestId}`); 
      message.success('Yêu cầu rút tiền đã được hủy!');
      fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error canceling withdrawal request:", error);
      message.error('Hủy yêu cầu không thành công!');
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
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      
      const numericAmount = Number(values.amount.replace(/[^0-9]/g, ''));
      
      const withdrawalRequest = {
        accountNumber: values.accountNumber,
        fullName: values.fullName,
        phone: values.phone,
        amount: numericAmount,
        remarks: values.remarks
      };

      const response = await api.post('Users/api/withdrawal', withdrawalRequest);
      
      message.success('Yêu cầu rút tiền đã được gửi thành công!');
      setIsModalVisible(false);
      form.resetFields();
      
      // Refresh data
      fetchRevenue();
      fetchCurrentIncome();
      fetchWithdrawalRequests();
      
    } catch (error) {
      if (error.response?.data) {
        message.error(error.response.data);
      } else if (error.errorFields) {
        // Form validation errors
        message.error('Vui lòng kiểm tra lại thông tin!');
      } else {
        message.error('Có lỗi xảy ra khi gửi yêu cầu!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showModal = () => {
    form.setFieldsValue({
      amount: formatCurrency(currentIncome)
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('vi-VN');
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
        title="Yêu Cầu Rút Tiền"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isSubmitting}
            onClick={handleWithdraw}
          >
            Gửi Yêu Cầu
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            amount: formatCurrency(currentIncome)
          }}
        >
          <Form.Item
            name="accountNumber"
            label="Số Tài Khoản"
            rules={validationRules.accountNumber}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tên Chủ Tài Khoản"
            rules={validationRules.fullName}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số Điện Thoại"
            rules={validationRules.phone}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số Tiền Rút"
            rules={validationRules.amount}
          >
            <Input 
              placeholder="Nhập số tiền cần rút"
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                form.setFieldsValue({
                  amount: formatCurrency(numericValue)
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Ghi Chú"
          >
            <Input.TextArea 
              placeholder="Nhập ghi chú (nếu có)"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <div className="text-sm text-gray-500 mt-4">
            <p>Số dư khả dụng: {formatCurrency(currentIncome)} VNĐ</p>
            <p>Số tiền rút tối thiểu: 100,000 VNĐ</p>
            <p>Thời gian xử lý: 1-3 ngày làm việc</p>
          </div>
        </Form>
      </Modal>
      {/* Modal để hiển thị lịch sử yêu cầu rút tiền */}
      <Modal
        title="Lịch Sử Rút Tiền"
        open={isHistoryModalVisible}
        onCancel={handleHistoryCancel}
        footer={null}
        width={800}
      >
        <Table
          dataSource={withdrawalRequests}
          columns={[
            {
              title: 'Ngày Yêu Cầu',
              dataIndex: 'requestDate',
              key: 'requestDate',
              render: (date) => new Date(date).toLocaleDateString('vi-VN')
            },
            {
              title: 'Số Tiền',
              dataIndex: 'amount',
              key: 'amount',
              render: (amount) => `${formatCurrency(amount)} VNĐ`
            },
            {
              title: 'Trạng Thái',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <span className={`
                  ${status === 'Approved' ? 'text-green-500' : ''}
                  ${status === 'Pending' ? 'text-yellow-500' : ''}
                  ${status === 'Rejected' ? 'text-red-500' : ''}
                `}>
                  {status === 'Approved' ? 'Đã Duyệt' : 
                   status === 'Pending' ? 'Đang Chờ' : 'Từ Chối'}
                </span>
              )
            },
            {
              title: 'Thao Tác',
              key: 'action',
              render: (_, record) => (
                record.status === 'Pending' && (
                  <Button 
                    type="link" 
                    danger 
                    onClick={() => handleCancelRequest(record.requestId)}
                  >
                    Hủy yêu cầu
                  </Button>
                )
              )
            }
          ]}
        />
      </Modal>

      <Footer />
    </>
  );
};

export default ManageRevenue;