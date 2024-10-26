import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import axios from "axios";

const WithdrawalRequests = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithdrawalRequests = async (token) => {
    try {
      const response = await axios.get('https://localhost:7288/api/Admin/api/withdrawal-requests', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      const requestsWithIncome = await Promise.all(response.data.map(async (request) => {
        try {
          const incomeResponse = await axios.get(`https://localhost:7288/api/Users/api/users/${request.userId}/revenue`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          return { ...request, currentIncome: incomeResponse.data.currentIncome };
        } catch (error) {
          console.error(`Error fetching income for user ${request.userId}:`, error);
          return { ...request, currentIncome: 'N/A' };
        }
      }));
      setWithdrawalRequests(requestsWithIncome);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      setError("Lỗi khi tải danh sách yêu cầu rút tiền.");
    }
  };
  const handleApprove = async (requestId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`https://localhost:7288/api/Admin/api/withdrawals/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      message.success("Yêu cầu đã được duyệt.");
      fetchWithdrawalRequests(token);
    } catch (error) {
      console.error("Error approving withdrawal request:", error);
      message.error("Lỗi khi duyệt yêu cầu.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        await fetchWithdrawalRequests(token);
      } else {
        setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'requestId', key: 'requestId' },
    { title: 'Tên người dùng', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Số tài khoản', dataIndex: 'accountNumber', key: 'accountNumber' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Số tiền yêu cầu rút', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (text) => `${Number(text).toLocaleString('vi-VN')} VNĐ`
    },
    { 
      title: 'Thu nhập hiện tại', 
      dataIndex: 'currentIncome', 
      key: 'currentIncome',
      render: (text) => typeof text === 'number' ? `${text.toLocaleString('vi-VN')} VNĐ` : text
    },
    { 
      title: 'Ngày yêu cầu', 
      dataIndex: 'requestDate', 
      key: 'requestDate',
      render: (text) => new Date(text).toLocaleString('vi-VN')
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Ghi chú', dataIndex: 'remarks', key: 'remarks' },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Button 
          type="primary" 
          onClick={() => handleApprove(record.requestId)}
          disabled={record.status !== 'Pending'}
        >
          Duyệt
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách yêu cầu rút tiền</h2>
      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={withdrawalRequests}
          columns={columns}
          rowKey="requestId"
          pagination={false}
          bordered
        />
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default WithdrawalRequests;
