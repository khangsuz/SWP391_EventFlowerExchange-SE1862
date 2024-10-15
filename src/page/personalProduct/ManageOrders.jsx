import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Typography, Space, Button } from "antd";
import { EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import Header from "../../component/header";
import Footer from "../../component/footer";

const { Title } = Typography;

const ManageOrders = () => {
  const { userId } = useParams(); // Đảm bảo userId được khai báo ở đây
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders for userId:", userId); // Log userId
      const response = await api.get(`Orders/orders/seller/${userId}`);
      console.log("Fetched orders:", response.data); // Kiểm tra dữ liệu
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchOrders(); // Gọi hàm fetchOrders
  }, [userId]);

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: text => <strong>{text}</strong>,
    },
    {
      title: 'Ngày Đặt Hàng',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: status => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => {
          if (amount === null || amount === undefined) {
              return '0 VNĐ'; // Giá trị mặc định nếu null
          }
          return `${amount.toLocaleString('vi-VN')} VNĐ`; // Định dạng theo định dạng Việt Nam
      },
  },
  
  
    {
      title: 'Người Mua',
      dataIndex: 'buyerName',
      key: 'buyerName',
    },
    {
      title: 'Email Người Mua',
      dataIndex: 'buyerEmail',
      key: 'buyerEmail',
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>
            Chỉnh Sửa
          </Button>
          <Button type="danger" icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        <Title level={2} className="text-center mb-6">Quản Lý Đơn Hàng</Title>
        <Button 
          type="default" 
          icon={<HomeOutlined />} 
          onClick={() => navigate(`/personal-product/${userId}`)} 
          style={{ marginBottom: '20px', backgroundColor: '#1890ff', color: 'white' }}
        >
          Quay Về Xem Shop
        </Button>
        <Table 
          dataSource={orders} 
          columns={columns}
          rowKey="orderId" 
          pagination={{ pageSize: 5 }}
          bordered
          style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
          summary={pageData => {
            const totalAmount = pageData.reduce((sum, { totalAmount }) => sum + (totalAmount || 0), 0);
            const totalOrders = pageData.length;
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    <span style={{ color: '#000' }}>Tổng Cộng:</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    <span style={{ color: '#4caf50', fontSize: '18px' }}>
                      {totalAmount > 0 ? totalAmount.toLocaleString() : '0 VNĐ'} {/* Kiểm tra tổng tiền */}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    <span style={{ color: '#000' }}>Số Đơn Hàng:</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    <span style={{ color: '#4caf50', fontSize: '18px' }}>{totalOrders}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
      <Footer />
      <style jsx>{`
        .table-row-light {
          background-color: #f5f5f5;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-thead > tr > th {
          background: #1890ff;
          color: white;
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default ManageOrders;
