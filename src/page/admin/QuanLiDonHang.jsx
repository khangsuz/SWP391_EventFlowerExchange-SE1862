import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Modal, Form, Select, message, Space, Tag, Card, Typography, Row, Col, Statistic, Input } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  ShoppingCartOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import api from '../../config/axios';

const { Title, Text } = Typography;
const { Column } = Table;
const { Option } = Select;
const { Search } = Input;

const QuanLiDonHang = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      const processedOrders = await Promise.all(response.data.map(async (order) => {
        try {
          const detailResponse = await api.get(`/admin/orders/${order.orderId}`);
          return {
            ...order,
            orderStatus: order.orderStatus || 'Pending',
            orderDelivery: order.orderDelivery || 'ChờXửLý',
            totalAmount: order.totalAmount || 0,
            deliveryAddress: order.deliveryAddress || '',
            wardName: order.wardName || '',
            note: order.note || '',
            orderItems: detailResponse.data.orderItems || []
          };
        } catch (error) {
          console.error(`Error fetching details for order ${order.orderId}:`, error);
          return order; // Return original order if detail fetch fails
        }
      }));
  
      const sortedOrders = processedOrders.sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
      });
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || "Lỗi khi tải dữ liệu đơn hàng.");
      message.error(error.response?.data?.message || "Lỗi khi tải dữ liệu đơn hàng.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có ngày';
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/delivery`, {
        orderDelivery: newStatus
      });
      message.success("Cập nhật trạng thái giao hàng thành công!");
      fetchOrders();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái giao hàng.");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      if (!newStatus) {
        message.error("Vui lòng chọn trạng thái mới.");
        return;
      }
  
      await api.put(`/admin/orders/${selectedOrder.orderId}/status`, {
        orderStatus: newStatus
      });
  
      message.success("Cập nhật trạng thái đơn hàng thành công!");
      setIsUpdateStatusModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
  };

  const showUpdateStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setIsUpdateStatusModalVisible(true);
  };

  const showDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleCancelUpdateStatus = () => {
    setIsUpdateStatusModalVisible(false);
  };

  const handleCancelDetail = () => {
    setIsDetailModalVisible(false);
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      'Pending': 'gold',
      'Completed': 'green',
      'Cancelled': 'red'
    };
    return statusColors[status] || 'default';
  };

  const getDeliveryStatusColor = (status) => {
    const statusColors = {
      'ChờXửLý': 'default',
      'ĐangXửLý': 'processing',
      'ĐãGửiHàng': 'warning',
      'ĐãGiaoHàng': 'success',
      'ĐãHủy': 'error'
    };
    return statusColors[status] || 'default';
  };

  // Thêm hàm kiểm tra trạng thái
  const isOrderEditable = (status) => {
    return status !== 'Completed' && status !== 'Cancelled';
  };

  if (loading) return <Spin />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Card */}
      <Card className="page-header">
        <Title level={2}>
          <Space>
            <ShoppingCartOutlined />
            Quản Lý Đơn Hàng
          </Space>
        </Title>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Tổng đơn hàng"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng đang xử lý"
              value={orders.filter(order => order.orderStatus === 'Pending').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng hoàn thành"
              value={orders.filter(order => order.orderStatus === 'Completed').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card style={{ marginTop: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Search
            placeholder="Tìm kiếm đơn hàng..."
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
          >
            Làm mới
          </Button>
        </Space>

        <Table
          dataSource={orders}
          rowKey="orderId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`
          }}
          scroll={{ x: 1500 }}
        >
          <Column
            title="ID"
            dataIndex="orderId"
            key="orderId"
            width={80}
          />
          <Column
            title="Người mua"
            dataIndex="userName"
            key="userName"
            render={(text) => <span className="font-medium">{text || 'Không có tên'}</span>}
          />
          <Column
  title="Ngày đặt hàng"
  dataIndex="orderDate"
  key="orderDate"
  defaultSortOrder="descend"
  sorter={(a, b) => new Date(b.orderDate) - new Date(a.orderDate)}
  render={(text) => (
    <span className="text-gray-600">
      {formatDate(text)}
    </span>
  )}
/>
          <Column
            title="Trạng thái"
            dataIndex="orderStatus"
            key="orderStatus"
            render={(status) => (
              <Tag color={getOrderStatusColor(status)}>
                {status}
              </Tag>
            )}
          />
          <Column
            title="Trạng thái Giao Hàng"
            dataIndex="orderDelivery"
            key="orderDelivery"
            render={(text, record) => (
              <Select
                value={text || "ChờXửLý"}
                style={{ width: 150 }}
                onChange={(value) => handleDeliveryStatusChange(record.orderId, value)}
                disabled={!isOrderEditable(record.orderStatus)}
              >
                <Option value="ChờXửLý">Chờ xử lý</Option>
                <Option value="ĐangXửLý">Đang xử lý</Option>
                <Option value="ĐãGửiHàng">Đã gửi hàng</Option>
                <Option value="ĐãGiaoHàng">Đã giao hàng</Option>
                <Option value="ĐãHủy">Đã hủy</Option>
              </Select>
            )}
          />
          <Column
            title="Địa chỉ giao hàng"
            key="address"
            render={(_, record) => (
              <span>
                {record.deliveryAddress}, {record.wardName}
              </span>
            )}
            ellipsis={true}
          />
           <Column 
    title="Ghi chú" 
    dataIndex="note" 
    key="note"
    width={200}
    ellipsis={{ showTitle: true }}
    render={(note) => (
      <span title={note}>
        {note || 'Không có ghi chú'}
      </span>
    )}
  />
          <Column
            title="Tổng tiền"
            dataIndex="totalAmount"
            key="totalAmount"
            render={(amount) => formatCurrency(amount)}
          />
          <Column
            title="Hành động"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                {isOrderEditable(record.orderStatus) ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => showUpdateStatusModal(record)}
                  >
                    Cập nhật
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    disabled
                    title="Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy"
                  >
                    Cập nhật
                  </Button>
                )}
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => showDetailModal(record)}
                >
                  Chi tiết
                </Button>
              </Space>
            )}
          />
        </Table>

        <Modal
          title="Cập nhật trạng thái đơn hàng"
          open={isUpdateStatusModalVisible}
          onOk={handleUpdateStatus}
          onCancel={handleCancelUpdateStatus}
          okText="Cập nhật"
          cancelText="Hủy"
        >
          <Form layout="vertical">
            <Form.Item
              label="Trạng thái mới"
              required
            >
              <Select
                value={newStatus}
                onChange={setNewStatus}
              >
                <Option value="Pending">Đang chờ</Option>
                <Option value="Completed">Đã hoàn thành</Option>
                <Option value="Cancelled">Đã hủy</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {selectedOrder && (
         <Modal
         title={`Chi tiết đơn hàng #${selectedOrder.orderId}`}
         open={isDetailModalVisible}
         onCancel={handleCancelDetail}
         width={800}
         footer={null}
       >
         <div className="mb-4">
           <p><strong>Người mua:</strong> {selectedOrder.userName || 'Không có tên'}</p>
           <p><strong>Địa chỉ:</strong> {selectedOrder.deliveryAddress && selectedOrder.wardName ? 
             `${selectedOrder.deliveryAddress}, ${selectedOrder.wardName}` : 'Chưa có địa chỉ'}</p>
           <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.orderDate)}</p>
           <p><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</p>
           {/* Thêm 2 dòng này */}
           <p><strong>Trạng thái đơn hàng:</strong> 
             <Tag color={getOrderStatusColor(selectedOrder.orderStatus)} className="ml-2">
               {selectedOrder.orderStatus}
             </Tag>
           </p>
           <p><strong>Trạng thái giao hàng:</strong> 
             <Tag color={getDeliveryStatusColor(selectedOrder.orderDelivery)} className="ml-2">
               {selectedOrder.orderDelivery}
             </Tag>
           </p>
         </div>
         <Table
           dataSource={selectedOrder.orderItems}
           rowKey="orderItemId"
           pagination={false}
         >
           <Column title="ID" dataIndex="orderItemId" width={80} />
           <Column 
             title="Tên hoa" 
             dataIndex="flowerName"
             key="flowerName"
             render={(text) => text || 'Không có tên'}
           />
           <Column
             title="Số lượng"
             dataIndex="quantity"
             width={100}
             align="right"
           />
           <Column
             title="Đơn giá"
             dataIndex="price"
             width={120}
             align="right"
             render={(price) => formatCurrency(price)}
           />
           <Column
             title="Thành tiền"
             key="total"
             width={120}
             align="right"
             render={(_, record) => formatCurrency(record.quantity * record.price)}
           />
         </Table>
         <div className="mt-4 text-right">
           <p className="text-lg font-medium">
             Tổng tiền: {formatCurrency(selectedOrder.totalAmount)}
           </p>
         </div>
       </Modal>
        )}
      </Card>
    </div>
  );
};

export default QuanLiDonHang;
