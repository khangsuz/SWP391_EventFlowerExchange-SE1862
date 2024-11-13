import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Tag, Typography, Space, Button, Modal, Form, Input, message, Select, Tabs, Upload, Image } from "antd";
import { EditOutlined, DeleteOutlined, HomeOutlined, CheckCircleOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons';
import Header from "../../component/header";
import Footer from "../../component/footer";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const deliveryStatuses = [
  { value: 0, label: "ChờXửLý" },
  { value: 1, label: "ĐãGửiHàng" },
  { value: 2, label: "ĐãGiaoHàng" },
  { value: 3, label: "ĐãHủy" }
];
const getAvailableStatuses = (currentStatus) => {
  switch (currentStatus) {
    case "ChờXửLý":
      return ["ChờXửLý", "ĐãGửiHàng", "ĐãGiaoHàng" ];
    case "ĐãGửiHàng":
      return ["ĐãGửiHàng", "ĐãGiaoHàng"];
    case "ĐãGiaoHàng":
      return ["ĐãGiaoHàng"];
    default:
      return ["ChờXửLý"];
  }
};
const filterOrdersByStatus = (orders, status) => {
  return orders.filter(order => {
    const deliveryStatus = deliveryStatuses.find(s => s.value === Number(order.orderDelivery))?.label;
    
  
    
    return deliveryStatus === status;
  });
};
const ManageOrders = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingStatus, setEditingStatus] = useState({});
  const [deliveryImages, setDeliveryImages] = useState({});
  const [imageUploadModal, setImageUploadModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const confirmStatusChange = async (orderId) => {
    const newStatus = editingStatus[orderId];
    if (!newStatus) return;

    try {
      if (newStatus === "ĐãHủy") {
        const orderToCancel = orders.find(order => order.orderId === orderId);
        if (orderToCancel) {
          const success = await updateProductQuantities(orderToCancel.products);
          if (!success) {
            message.error('Không thể cập nhật số lượng sản phẩm');
            return;
          }
        }
      }

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

  const handleDeliveryStatusChange = (orderId, newStatus) => {
    if (newStatus === "ĐãGiaoHàng") {
      setSelectedOrderId(orderId);
      setImageUploadModal(true);
    } else {
      setEditingStatus(prev => ({
        ...prev,
        [orderId]: newStatus
      }));
    }
  };

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        onError('Kích thước file không được vượt quá 5MB');
        message.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      
      console.log('File being uploaded:', file);
      console.log('FormData content:', formData);
      
      const response = await api.post(`Orders/upload-delivery-image/${selectedOrderId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': '*/*'
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('Upload response:', response);
      
      if (response.status === 200) {
        const imageUrl = response.data.imageUrl;
        setDeliveryImages(prev => ({
          ...prev,
          [selectedOrderId]: imageUrl
        }));
        onSuccess('Upload thành công');
        message.success('Upload ảnh thành công');
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error details:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Không thể upload ảnh. Vui lòng thử lại sau.';
      onError(errorMessage);
      message.error(errorMessage);
    }
  };

  const handleImageUploadConfirm = async () => {
    if (!deliveryImages[selectedOrderId]) {
      message.error('Vui lòng upload ảnh giao hàng');
      return;
    }

    try {
      await updateOrderStatus(selectedOrderId, "ĐãGiaoHàng", deliveryImages[selectedOrderId]);
      message.success('Cập nhật trạng thái giao hàng thành công');
      setImageUploadModal(false);
      setSelectedOrderId(null);
      fetchOrders();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái giao hàng');
    }
  };

  const updateOrderStatus = async (orderId, newStatus, imageUrl = null) => {
    const data = { 
      orderDelivery: newStatus, 
      userId: currentUserId,
      deliveryImage: imageUrl 
    };
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
      const response = await api.get(`Orders/orders/seller/${userId}`);
      console.log("Raw response:", response.data);
      
      if (Array.isArray(response.data)) {
        const groupedOrders = response.data.reduce((acc, order) => {
          console.log("Processing order:", order);
          if (!acc[order.orderId]) {
            acc[order.orderId] = {
              ...order,
              deliveryImageUrl: order.deliveryImageUrl || order.deliveryImage,
            deliveryImage: order.deliveryImage || order.deliveryImageUrl,
          
              products: [{
                productName: order.productName,
                quantity: order.quantity,
                itemTotal: order.itemTotal,
                flowerId: order.flowerId,
                price: order.price
              }],
              key: `order_${order.orderId}`,
              sortDate: new Date(order.orderDate).getTime(),
              orderDelivery: Number(order.orderDelivery) || 0,
              cancelRequest: order.cancelRequest ? {
                fullName: order.cancelRequest.fullName,
                phone: order.cancelRequest.phone,
                reason: order.cancelRequest.reason,
                status: order.cancelRequest.status,
                requestDate: order.cancelRequest.requestDate
              } : null
            };
          } else {
            acc[order.orderId].products.push({
              productName: order.productName,
              quantity: order.quantity,
              itemTotal: order.itemTotal,
              flowerId: order.flowerId,
              price: order.price
            });
          }
          return acc;
        }, {});

        const sortedOrders = Object.values(groupedOrders)
          .sort((a, b) => b.sortDate - a.sortDate);

        console.log("Final processed orders:", sortedOrders);
        setOrders(sortedOrders);
      } else {
        console.warn("Invalid response format:", response.data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        message.error("Bạn không có quyền xem đơn hàng này");
      } else if (err.response?.status === 403) {
        message.error("Bạn không được phép xem đơn hàng của người khác");
      } else {
        message.error("Không thể tải danh sách đơn hàng");
      }
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

  const getColumnsForTab = (currentTab) => {
    const baseColumns = [
      {
        title: 'Mã Đơn Hàng',
        dataIndex: 'orderId',
        width: '5%',
        key: 'orderId',
        render: text => <strong>{text}</strong>,
      },
      {
        title: 'Ngày Đặt Hàng',
        dataIndex: 'orderDate',
        width: '15%',
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
        width: '15%',
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
          <Tag color={
            status === 'Completed' ? 'green' : 
            status === 'Pending' ? 'orange' : 
            'red'
          }>
            {status}
          </Tag>
        ),
      },
      {
        title: 'Trạng Thái Giao Hàng',
        dataIndex: 'orderDelivery',
        width: '5%',
        key: 'orderDelivery',
        render: (value, order) => {
          const currentStatus = deliveryStatuses.find(s => s.value === Number(value))?.label || 'ChờXửLý';
          const availableStatuses = getAvailableStatuses(currentStatus);
          const isDisabled = currentStatus === "ĐãGiaoHàng" || 
                            currentStatus === "ĐãHủy" || 
                            order.orderStatus === 'Pending';
          
                            if (order.orderStatus === 'Pending') {
                              return (
                                <Space>
                                  <Select
                                    value="ChờXửLý"
                                    style={{ width: 150 }}
                                    disabled={true}
                                  >
                                    <Option value="ChờXửLý">ChờXửLý</Option>
                                  </Select>
                                </Space>
                              );
                            }
          
          return (
            <Space>
              <Select
                value={editingStatus[order.orderId] || currentStatus}
                style={{ width: 150 }}
                onChange={(newStatus) => handleDeliveryStatusChange(order.orderId, newStatus)}
                disabled={isDisabled}
              >
                {availableStatuses.map(status => (
                  <Option 
                    key={status} 
                    value={status}
                  >
                    {status}
                  </Option>
                ))}
              </Select>
              {editingStatus[order.orderId] && editingStatus[order.orderId] !== currentStatus && (
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
        width: '25%',
        render: (_, record) => (
          <div className="space-y-2">
            {record.products.map((product, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <div><strong>Tên:</strong> {product.productName}</div>
                <div><strong>Số lượng:</strong> {product.quantity}</div>
                <div>
                  <strong>Thành tiền:</strong>{' '}
                  <span className="text-red-600">
                    {product.itemTotal?.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
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
          return <span className="text-red-600">{amount.toLocaleString('vi-VN')} VNĐ</span>;
        },
      },
      {
        title: 'Yêu cầu hủy đơn',
        key: 'cancelRequest',
        width: '15%',
        render: (_, record) => {
          if (record.orderDelivery === 3) {
            return <span className="text-red-500 font-medium">Đơn hàng đã được hủy</span>;
          }
          if (record.cancelRequest && [0, 1, 2].includes(record.orderDelivery)) {
            return (
              <div className="space-y-2">
                <div><strong>Người yêu cầu:</strong> {record.cancelRequest.fullName}</div>
                <div><strong>SĐT:</strong> {record.cancelRequest.phone}</div>
                <div><strong>Lý do:</strong> {record.cancelRequest.reason}</div>
                <Space>
                  <Button
                    type="primary"
                    danger
                    onClick={() => handleApproveCancellation(record.orderId)}
                  >
                    Duyệt hủy đơn
                  </Button>
                  <Button
                    onClick={() => handleRejectCancellation(record.orderId)}
                  >
                    Từ chối
                  </Button>
                </Space>
              </div>
            );
          }
          return <span>Không có yêu cầu hủy</span>;
        }
      }
    ];

    if (currentTab === "ĐãGiaoHàng") {
      baseColumns.push({
        title: 'Ảnh giao hàng',
        key: 'deliveryImage',
        render: (_, record) => {
          const imageUrl = record.deliveryImageUrl || deliveryImages[record.orderId];
          if (imageUrl) {
            return (
              <Image 
                src={`${'https://localhost:7288'}${imageUrl}`} 
                alt="Ảnh giao hàng" 
                width={100}
                preview={true}
              />
            );
          }
          return <span className="text-gray-400">Chưa có ảnh</span>;
        }
      });
    }

    return baseColumns;
  };

  const renderOrderTable = (orders, currentTab) => (
    <Table 
      dataSource={orders} 
      columns={getColumnsForTab(currentTab)}
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
  );

  const updateProductQuantities = async (products) => {
    try {
      for (const product of products) {
        await api.put(`Flowers/update-quantity/${product.flowerId}`, {
          quantity: product.quantity,
          action: 'add'
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating product quantities:', error);
      return false;
    }
  };

  const handleApproveCancellation = async (orderId) => {
    try {
      await api.put(`Orders/cancel-request/approve/${orderId}`);
      message.success('Đã duyệt yêu cầu hủy đơn hàng');
      fetchOrders();
    } catch (error) {
      console.error('Error approving cancellation:', error);
      message.error('Không thể duyệt yêu cầu hủy đơn hàng');
    }
  };

  const handleRejectCancellation = async (orderId) => {
    try {
      await api.put(`Orders/cancel-request/reject/${orderId}`);
      message.success('Đã từ chối yêu cầu hủy đơn hàng');
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
      message.error('Không thể từ chối yêu cầu hủy đơn hàng');
    }
  };

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
          <Tabs defaultActiveKey="ChờXửLý" className="mb-4">
            {deliveryStatuses.map(status => (
              <TabPane 
                tab={`${status.label} (${filterOrdersByStatus(orders, status.label).length})`} 
                key={status.label}
              >
                {renderOrderTable(filterOrdersByStatus(orders, status.label), status.label)}
              </TabPane>
            ))}
          </Tabs>
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
          <Form.Item label="Số iện thoại Người Mua" name="buyerPhone">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Upload ảnh giao hàng"
        open={imageUploadModal}
        onCancel={() => {
          setImageUploadModal(false);
          setSelectedOrderId(null);
        }}
        onOk={handleImageUploadConfirm}
      >
        <Upload
          customRequest={handleImageUpload}
          maxCount={1}
          listType="picture"
          accept="image/*"
          beforeUpload={(file) => {
            const isImage = file.type.startsWith('image/');
            const isLt5M = file.size / 1024 / 1024 < 5;
            
            if (!isImage) {
              message.error('Chỉ được upload file ảnh!');
              return false;
            }
            if (!isLt5M) {
              message.error('Ảnh phải nhỏ hơn 5MB!');
              return false;
            }
            return true;
          }}
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
          }}
        >
          <Button icon={<UploadOutlined />}>Upload ảnh giao hàng</Button>
        </Upload>
        <div className="mt-4 text-red-500">
          *Lưu ý: Cần upload ảnh giao hàng để xác nhận đã giao hàng thành công
        </div>
      </Modal>
    </>
  );
};

export default ManageOrders;