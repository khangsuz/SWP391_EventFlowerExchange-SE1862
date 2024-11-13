import React, { useEffect, useState } from "react";
import { Table, message, Button, Input, Space, Tag, Card, Tooltip, Row, Col, Typography, Statistic } from "antd";
import { 
  MoneyCollectOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from "axios";

const { Title } = Typography;

const WithdrawalRequests = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
 

  // Thêm function search
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = withdrawalRequests.filter(item => 
      item.sellerName?.toLowerCase().includes(value.toLowerCase()) ||
      item.fullName?.toLowerCase().includes(value.toLowerCase()) ||
      item.accountNumber?.includes(value) ||
      item.phone?.includes(value)
    );
    setFilteredData(filtered);
  };

  // Thêm function refresh
  const handleRefresh = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetchWithdrawalRequests(token);
  };

  

  const getStatusTag = (status) => {
    const statusColors = {
      'Pending': 'gold',
      'Approved': 'green',
      'Rejected': 'red'
    };
    return (
      <Tag color={statusColors[status] || 'default'}>
        {status || 'Chờ Xử Lý'}
      </Tag>
    );
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'requestId', 
      key: 'requestId',
      width: 80,
      fixed: 'left'
    },
    { 
      title: 'Tên người bán', 
      dataIndex: 'sellerName', 
      key: 'sellerName',
      width: 150,
      sorter: (a, b) => a.sellerName.localeCompare(b.sellerName)
    },
    { 
      title: 'Tên người dùng tài khoản', 
      dataIndex: 'fullName', 
      key: 'fullName',
      width: 150,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName)
    },
    { 
      title: 'Số tài khoản', 
      dataIndex: 'accountNumber', 
      key: 'accountNumber',
      width: 150
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone', 
      key: 'phone',
      width: 120
    },
    { 
      title: 'Thu nhập hiện tại', 
      dataIndex: 'currentBalance', 
      key: 'currentBalance',
      width: 150,
      render: (value) => `${value.toLocaleString()} VNĐ`,
      sorter: (a, b) => a.currentBalance - b.currentBalance
    },
    
    
    { 
      title: 'Số tiền rút', 
      dataIndex: 'amount', 
      key: 'amount',
      width: 150,
      render: (value) => `${value.toLocaleString()} VNĐ`
    },
    
    { 
      title: 'Ngày yêu cầu', 
      dataIndex: 'requestDate', 
      key: 'requestDate',
      width: 150,
      render: (text) => text ? new Date(text).toLocaleDateString() : 'Không có ngày'
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Chờ Xử Lý', value: 'Pending' },
        { text: 'Đã Duyệt', value: 'Approved' },
        { text: 'Đã Từ Chối', value: 'Rejected' }
      ],
      onFilter: (value, record) => record.status === value
    },
    { 
      title: 'Ghi chú', 
      dataIndex: 'remarks', 
      key: 'remarks',
      width: 200
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text, record) => (
        <Space>
          <Tooltip title={record.balanceAfterWithdrawal < 0 ? "Số dư không đủ" : ""}>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.requestId)}
              disabled={record.status !== 'Pending' || record.balanceAfterWithdrawal < 0}
            >
              Duyệt
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Thêm useEffect và fetchWithdrawalRequests
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchWithdrawalRequests(token);
  }, []); // Empty dependency array means this runs once on mount

  const fetchWithdrawalRequests = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get('https://localhost:7288/api/Admin/api/withdrawal-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch current balance for each seller
      const requestsWithBalance = await Promise.all(
        response.data.map(async (request) => {
          try {
            const balanceResponse = await axios.get(`https://localhost:7288/api/Users/api/users/${request.userId}/revenue`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            return {
              ...request,
              currentBalance: balanceResponse.data.currentIncome || 0,
              
              balanceAfterWithdrawal: (balanceResponse.data.currentIncome - request.amount) || 0
            };
          } catch (error) {
            console.error(`Error fetching balance for user ${request.userId}:`, error);
            return {
              ...request,
              currentBalance: 0,
              currentAtRequestBalance: 0,
              balanceAfterWithdrawal: 0
            };
          }
        })
      );

      setWithdrawalRequests(requestsWithBalance);
      setFilteredData(requestsWithBalance);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      message.error("Không thể tải danh sách yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm handleApprove
  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`https://localhost:7288/api/Admin/api/withdrawals/${requestId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success("Đã duyệt yêu cầu rút tiền");
      fetchWithdrawalRequests(token); // Refresh data after approval
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      message.error("Không thể duyệt yêu cầu rút tiền");
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Card */}
      <Card className="page-header">
        <Title level={2}>
          <Space>
            <MoneyCollectOutlined />
            Quản Lý Yêu Cầu Rút Tiền
          </Space>
        </Title>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Tổng yêu cầu"
              value={withdrawalRequests.length}
              prefix={<MoneyCollectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Đang chờ xử lý"
              value={withdrawalRequests.filter(req => req.status === 'Pending').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Đã duyệt"
              value={withdrawalRequests.filter(req => req.status === 'Approved').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card style={{ marginTop: '16px' }} className="content-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Search and Filter Section */}
          <Row gutter={16} align="middle">
            <Col flex="400px">
              <Input.Search
                placeholder="Tìm theo tên người bán, tên tài khoản, STK, SĐT..."
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
                style={{ width: '100%' }}
              />
            </Col>
            <Col>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                Làm mới
              </Button>
            </Col>
          </Row>

          {/* Table Section */}
          <Table
            dataSource={filteredData.length > 0 ? filteredData : withdrawalRequests}
            columns={columns}
            rowKey="requestId"
            pagination={{
              total: filteredData.length > 0 ? filteredData.length : withdrawalRequests.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
              showQuickJumper: true
            }}
            scroll={{ x: 1500 }}
            loading={loading}
            size="middle"
          />
        </Space>

        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      <style jsx>{`
        .page-header {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .content-card {
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
        }
        .ant-statistic-title {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
        }
        .ant-statistic-content {
          font-size: 24px;
          font-weight: 600;
        }
        .ant-tag {
          min-width: 80px;
          text-align: center;
        }
        .ant-card-hoverable:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default WithdrawalRequests;