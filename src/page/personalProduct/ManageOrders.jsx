import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Typography, Space, Button, Modal, Form, Input, message, Select } from "antd";
import { EditOutlined, DeleteOutlined, HomeOutlined, CheckCircleOutlined, CheckOutlined } from '@ant-design/icons';
import Header from "../../component/header";
import Footer from "../../component/footer";

const { Title } = Typography;
const { Option } = Select;

const deliveryStatuses = [
  "ChờXửLý",
  "ĐangXửLý",
  "ĐãGửiHàng",
  "ĐãHủy",
  "ĐãGiaoHàng",
];
const getAvailableStatuses = (currentStatus) => {
  const currentIndex = deliveryStatuses.indexOf(currentStatus);
  return deliveryStatuses.slice(currentIndex);
};
const ManageOrders = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingStatus, setEditingStatus] = useState({});

  const handleDeliveryStatusChange = (orderId, newStatus) => {
    setEditingStatus(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };
  const confirmStatusChange = async (orderId) => {
    const newStatus = editingStatus[orderId];
    if (!newStatus) return;

    try {
      await updateOrderStatus(orderId, newStatus);
      message.success('Cập nhật trạng thái giao hàng thành công');
      setEditingStatus(prev => ({
        ...prev,
        [orderId]: undefined
      }));
      fetchOrders();
    } catch (error) {
      console.error('Error updating order delivery status:', error);
      message.error('Không thể cập nhật trạng thái giao hàng: ' + (error.response?.data || error.message));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const data = { orderDelivery: newStatus, userId: currentUserId };
    await api.put(`Orders/${orderId}/delivery`, data);
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
      
      const groupedOrders = response.data.reduce((acc, order) => {
        if (!acc[order.orderId]) {
          acc[order.orderId] = {
            ...order,
            products: [{
              productName: order.productName,
              quantity: order.quantity,
              itemTotal: order.itemTotal
            }],
            key: `order_${order.orderId}`,
            sortDate: new Date(order.orderDate).getTime(),
            orderDelivery: order.orderDelivery || 'ChờXửLý'
          };
        } else {
          acc[order.orderId].products.push({
            productName: order.productName,
            quantity: order.quantity,
            itemTotal: order.itemTotal
          });
        }
        return acc;
      }, {});

      const sortedOrders = Object.values(groupedOrders).sort((a, b) => b.sortDate - a.sortDate);

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      message.error("Không thể tải danh sách đơn hàng");
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
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.sortDate - b.sortDate,
      render: (date) => {
        const orderDate = new Date(date);
        return orderDate.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
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
      render: (text, order) => {
        const availableStatuses = getAvailableStatuses(text);
        return (
          <Space>
            <Select
              value={editingStatus[order.orderId] || text}
              style={{ width: 150 }}
              onChange={(value) => handleDeliveryStatusChange(order.orderId, value)}
            >
              {availableStatuses.map(status => (
                <Option 
                  key={status} 
                  value={status} 
                  disabled={status === "ĐãGiaoHàng" && text !== "ĐãGửiHàng"}
                >
                  {status}
                </Option>
              ))}
            </Select>
            {editingStatus[order.orderId] && editingStatus[order.orderId] !== text && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={() => confirmStatusChange(order.orderId)}
              >
                Xác nhận
              </Button>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Sản Phẩm',
      key: 'products',
      render: (_, record) => (
        <div className="space-y-2">
          {record.products.map((product, index) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <div><strong>Tên:</strong> {product.productName}</div>
              <div><strong>Số lượng:</strong> {product.quantity}</div>
              <div><strong>Thành tiền:</strong> {product.itemTotal?.toLocaleString('vi-VN')} VNĐ</div>
            </div>
          ))}
        </div>
      ),
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
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>
        {`
          .ant-message-success .anticon {
            color: #52c41a !important;
          }
          
          .ant-message-success .anticon svg {
            fill: #52c41a !important;
          }
          
          .ant-message-notice-content {
            background: #f6ffed !important;
            border: 1px solid #b7eb8f !important;
          }
        `}
      </style>
      
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
            rowKey={record => record.key}
            pagination={{ 
              pageSize: 5,
              defaultCurrent: 1,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
            }}
            bordered
            className="w-full bg-white shadow-md rounded-lg"
            rowClassName={(record, index) => (index % 2 === 0 ? 'bg-gray-100' : 'bg-white')}
            defaultSortOrder="descend"
            sortDirections={['descend', 'ascend']}
            summary={pageData => {
              const totalAmount = pageData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
              const totalOrders = pageData.length;
              const totalProducts = pageData.reduce((sum, order) => sum + order.products.length, 0);
              
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} className="text-right font-bold">
                      Tổng Cộng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2} className="text-center font-bold">
                      <span className="text-green-600 text-lg">
                        {totalAmount.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} className="text-right font-bold">
                      Số Đơn Hàng / Sản Phẩm:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2} className="text-center font-bold">
                      <span className="text-green-600 text-lg">
                        {totalOrders} đơn / {totalProducts} sản phẩm
                      </span>
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
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleEditOrder} initialValues={currentOrder}>
          <Form.Item label="Địa chỉ giao hàng" name="deliveryAddress">
            <Input />
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
