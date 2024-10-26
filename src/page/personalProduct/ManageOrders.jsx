import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Typography, Space, Button, Modal, Form, Input, message, Select } from "antd";
import { EditOutlined, DeleteOutlined, HomeOutlined, CheckOutlined } from '@ant-design/icons';
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
  if (currentStatus === "ĐãHủy") {
    return ["ĐãHủy"];
  }
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
  const [isShippingModalVisible, setIsShippingModalVisible] = useState(false);
  const [shippingForm] = Form.useForm();
  const [tempOrderId, setTempOrderId] = useState(null);
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


  const handleShippingSubmit = (values) => {
    updateOrderStatus(tempOrderId, "ĐãGửiHàng", values.shippingCode);
    setIsShippingModalVisible(false);
    shippingForm.resetFields();
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
        alert("Không thể xóa đơn hàng. Vui lòng kiểm tra lại.");
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
  const initialValues = {
    productName: currentOrder?.productName,
    quantity: currentOrder?.quantity,
    deliveryAddress: currentOrder?.deliveryAddress,
    buyerEmail: currentOrder?.buyerEmail, 
    buyerPhone: currentOrder?.buyerPhone, 
  };
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
      title: 'Địa Chỉ Giao Hàng',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
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
      title: 'Số điện thoại Người Mua',
      dataIndex: 'buyerPhone',
      key: 'buyerPhone',
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={()  => showEditModal(record)} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>
            Chỉnh Sửa
          </Button>
          
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => deleteOrder(record.orderId)}>
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
       {/* Modal chỉnh sửa đơn hàng */}
       <Modal
        title="Chỉnh Sửa Đơn Hàng"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        key={currentOrder ? currentOrder.orderId : 'modal'}
      >
        <Form
          initialValues={{
            productName: currentOrder?.productName,
            quantity: currentOrder?.quantity,
            deliveryAddress: currentOrder?.deliveryAddress,
            buyerEmail: currentOrder?.buyerEmail, 
            buyerPhone: currentOrder?.buyerPhone, 
          }}
          onFinish={handleEditOrder}
        >
          <Form.Item
            label="Tên Sản Phẩm"
            name="productName"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số Lượng"
            name="quantity"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Địa Chỉ Giao Hàng"
            name="deliveryAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email Người Nhận"
            name="buyerEmail"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số Điện Thoại Người Nhận"
            name="buyerPhone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
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