import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Typography, Space, Button, Modal, Form, Input, message, Select } from "antd";
import { EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import Header from "../../component/header";
import Footer from "../../component/footer";

const { Title } = Typography;

const ManageOrders = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    try {
        await api.put(`Orders/${orderId}/delivery`, { orderDelivery: newStatus, userId });
        message.success('Cập nhật trạng thái giao hàng thành công');
        fetchOrders();
    } catch (error) {
        console.error('Error updating order delivery status:', error);
        message.error('Không thể cập nhật trạng thái giao hàng: ' + (error.response?.data || error.message));
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
      navigate(`/manage-orders/${currentUserId}`); 
    }
  }, [currentUserId, userId, navigate]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders for userId:", userId); 
      const response = await api.get(`Orders/orders/seller/${userId}`);
      console.log("Fetched orders:", response.data); 
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
        await api.delete(`Orders/${orderId}`); 
        fetchOrders(); 
        console.log(`Order ${orderId} deleted successfully.`);
    } catch (err) {
        console.error("Error deleting order:", err.response?.data || err);
        message.error("Không thể xóa đơn hàng. Vui lòng kiểm tra lại.");
    }
  };

  const showEditModal = (order) => {
    setCurrentOrder(order); 
    setIsEditModalVisible(true); 
  };

  const handleEditOrder = async (values) => {
    try {
      await api.put(`Orders/update/${currentOrder.orderId}`, {
        deliveryAddress: values.deliveryAddress,
        quantity: values.quantity,
        buyerEmail: values.buyerEmail,
        buyerPhone: values.buyerPhone,
      });
      message.success('Cập nhật đơn hàng thành công!');
      fetchOrders(); 
      setIsEditModalVisible(false); 
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Không thể cập nhật đơn hàng.');
    }
  };

  useEffect(() => {
    fetchOrders();
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
      title: 'Thông Tin Người Mua',
      key: 'buyerInfo',
      render: (_, record) => (
        <div className="space-y-1">
          <div><strong>Người Mua:</strong> {record.buyerName}</div>
          <div><strong>Email:</strong> {record.buyerEmail}</div>
          <div><strong>SĐT:</strong> {record.buyerPhone}</div>
          <div><strong>Địa Chỉ:</strong> {record.deliveryAddress}</div>
        </div>
      ),
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
      title: 'Trạng Thái Giao Hàng',
      dataIndex: 'orderDelivery',
      key: 'orderDelivery',
      render: (text, order) => (
        <Select
          defaultValue={text}
          style={{ width: 150 }}
          onChange={(value) => handleDeliveryStatusChange(order.orderId, value)}
        >
          <Option value="ChờXửLý">Chờ xử lý</Option>
          <Option value="ĐangXửLý">Đang xử lý</Option>
          <Option value="ĐãGửiHàng">Đã gửi hàng</Option>
          <Option value="ĐãGiaoHàng">Đã giao hàng</Option>
          <Option value="ĐãHủy">Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: 'Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => {
        if (amount === null || amount === undefined) {
          return '0 VNĐ'; 
        }
        return `${amount.toLocaleString('vi-VN')} VNĐ`;
      },
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} className="bg-blue-500 hover:bg-blue-600 border-none text-white">
            Chỉnh Sửa
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => deleteOrder(record.orderId)} className="bg-red-500 hover:bg-red-600 border-none text-white">
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto">
        <Title level={2} className="text-center mb-6 mt-6">Quản Lý Đơn Hàng</Title>
        <Button 
          type="default" 
          icon={<HomeOutlined />} 
          onClick={() => navigate(`/personal-product/${userId}`)} 
          className="mb-6 bg-blue-500 hover:bg-blue-600 text-white"
        >
          Quay Về Xem Shop
        </Button>
        <div className="overflow-x-auto">
          <Table 
            dataSource={orders} 
            columns={columns}
            rowKey="orderId" 
            pagination={{ pageSize: 5 }}
            bordered
            className="w-full bg-white shadow-md rounded-lg"
            rowClassName={(record, index) => (index % 2 === 0 ? 'bg-gray-100' : 'bg-white')}
            summary={pageData => {
              const totalAmount = pageData.reduce((sum, { totalAmount }) => sum + (totalAmount || 0), 0);
              const totalOrders = pageData.length;
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} className="text-right font-bold">
                      Tổng Cộng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2} className="text-center font-bold">
                      <span className="text-green-600 text-lg">{totalAmount > 0 ? totalAmount.toLocaleString() : '0 VNĐ'}</span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} className="text-right font-bold">
                      Số Đơn Hàng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2} className="text-center font-bold">
                      <span className="text-green-600 text-lg">{totalOrders}</span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      </div>
      <Footer />

      <Modal
        title="Chỉnh Sửa Đơn Hàng"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleEditOrder} initialValues={currentOrder}>
          <Form.Item label="Địa chỉ giao hàng" name="deliveryAddress">
            <Input />
          </Form.Item>
          <Form.Item label="Số lượng" name="quantity">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Email Người Mua" name="buyerEmail">
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại Người Mua" name="buyerPhone">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ManageOrders;
