import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Modal, Form, Select, message } from 'antd';
import axios from "axios";

const { Column } = Table;
const { Option } = Select;

const QuanLiDonHang = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");

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
    const token = localStorage.getItem("token");
    try {
      if (!newStatus) {
        message.error("Vui lòng chọn trạng thái mới.");
        return;
      }
  
      await axios.put(`https://localhost:7288/api/admin/orders/${selectedOrder.orderId}/status`, 
        JSON.stringify(newStatus), 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
  
      message.success("Cập nhật trạng thái đơn hàng thành công!");
      setIsUpdateStatusModalVisible(false);
      
      const response = await axios.get('https://localhost:7288/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://localhost:7288/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đơn hàng đã được xóa thành công!");
      const response = await axios.get('https://localhost:7288/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      message.error("Lỗi khi xóa đơn hàng.");
    }
  };

  const showUpdateStatusModal = (order) => {
    setSelectedOrder(order);
    setIsUpdateStatusModalVisible(true);
  };

  const showDetailModal = async (order) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(`https://localhost:7288/api/admin/orders/${order.orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedOrder(response.data);
        setIsDetailModalVisible(true);
    } catch (error) {
        message.error("Lỗi khi lấy chi tiết đơn hàng.");
    }
};

  const handleCancelUpdateStatus = () => {
    setIsUpdateStatusModalVisible(false);
  };

  const handleCancelDetail = () => {
    setIsDetailModalVisible(false);
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
        // visible={isUpdateStatusModalVisible}
        open={isUpdateStatusModalVisible}
        onOk={handleUpdateStatus}
        onCancel={handleCancelUpdateStatus}
      >
        <Form>
          <Form.Item label="Trạng thái mới">
            <Select value={newStatus} onChange={setNewStatus}>
              <Option value="Pending">Đang chờ</Option>
              <Option value="Completed">Đã hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal hiển thị chi tiết đơn hàng */}
        {selectedOrder && (
            <Modal
                title={`Chi tiết đơn hàng ${selectedOrder.orderId}`}
                // visible={isDetailModalVisible}
                open={isDetailModalVisible}
                onCancel={handleCancelDetail}
                footer={null}
            >
                <Table dataSource={selectedOrder.orderItems} rowKey="orderItemId">
                    <Column title="ID mục đơn hàng" dataIndex="orderItemId" key="orderItemId" />
                    <Column title="ID sản phẩm" dataIndex="flowerId" key="flowerId" />
                    <Column title="Số lượng" dataIndex="quantity" key="quantity" />
                    <Column title="Giá" dataIndex="price" key="price" />
                    <Column title="Tên hoa" dataIndex="flowerName" key="flowerName" />
                </Table>
            </Modal>
            )}
    </>
  );
};

export default QuanLiDonHang;
