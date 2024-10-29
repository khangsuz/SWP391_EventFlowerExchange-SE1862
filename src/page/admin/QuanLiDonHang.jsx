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
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("");


  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get('https://localhost:7288/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (error) {
        setError("Lỗi khi tải dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
    <>
      <Table dataSource={orders} rowKey="orderId">
        <Column title="ID" dataIndex="orderId" key="orderId" />
        <Column title="Người mua" dataIndex="userId" key="userId" />
        <Column title="Ngày đặt hàng" dataIndex="orderDate" key="orderDate" />
        <Column title="Trạng thái" dataIndex="orderStatus" key="orderStatus" />
        <Column title="Địa chỉ giao hàng" dataIndex="deliveryAddress" key="deliveryAddress" />
        <Column
          title="Hành động"
          key="action"
          render={(text, record) => (
            <>
              <Button onClick={() => showUpdateStatusModal(record)}>Cập nhật trạng thái</Button>
              <Button onClick={() => showDetailModal(record)}>Chi tiết</Button>
              <Button danger onClick={() => handleDeleteOrder(record.orderId)}>Xóa</Button>
            </>
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
