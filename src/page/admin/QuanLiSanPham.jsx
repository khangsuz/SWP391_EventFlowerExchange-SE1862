import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Modal, Input } from 'antd';
import axios from "axios";

const { Column } = Table;
const { confirm } = Modal;

const QuanLiHoa = () => {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFlower, setCurrentFlower] = useState(null);
  const [updatedFlower, setUpdatedFlower] = useState({
    flowerName: '',
    quantity: '',
    status: '',
  });

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get('https://localhost:7288/api/admin/flowers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlowers(response.data);
    } catch (error) {
      setError("Lỗi khi tải dữ liệu hoa.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFlower = (flowerId) => {
    const token = localStorage.getItem("token");
    confirm({
      title: 'Bạn có chắc chắn muốn xóa hoa này?',
      onOk: async () => {
        try {
          await axios.delete(`https://localhost:7288/api/admin/flowers/${flowerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFlowers(flowers.filter(flower => flower.flowerId !== flowerId));
        } catch (error) {
          setError("Lỗi khi xóa hoa.");
        }
      }
    });
  };

  const openEditModal = (flower) => {
    setCurrentFlower(flower);
    setUpdatedFlower({
      flowerName: flower.flowerName,
      quantity: flower.quantity,
      status: flower.status,
    });
    setIsModalVisible(true);
  };

  const updateFlower = async () => {
    const token = localStorage.getItem("token");
    const flowerId = currentFlower.flowerId; // Lấy flowerId từ currentFlower
    const dataToUpdate = {
      flowerName: updatedFlower.flowerName,
      quantity: updatedFlower.quantity,
      status: updatedFlower.status,
      condition: updatedFlower.condition, // Đảm bảo thêm condition nếu cần
    };
    
    console.log('Updating flower with data:', dataToUpdate); // Log chỉ các thuộc tính cần thiết
    try {
      await axios.put(`https://localhost:7288/api/admin/flowers/${flowerId}`, dataToUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFlowers(); // Tải lại danh sách hoa
      setIsModalVisible(false); // Đóng modal
    } catch (error) {
      console.error('Lỗi khi cập nhật hoa:', error.response?.data || error.message); // Log chi tiết lỗi
    }
  };

  if (loading) return <Spin />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <Table dataSource={flowers} rowKey="flowerId">
        <Column title="ID" dataIndex="flowerId" key="flowerId" />
        <Column title="Tên hoa" dataIndex="flowerName" key="flowerName" />
        <Column title="Người bán" dataIndex="userId" key="userId" />
        <Column title="Số lượng" dataIndex="quantity" key="quantity" />
        <Column title="Trạng thái" dataIndex="status" key="status" />
        <Column
          title="Hành động"
          key="actions"
          render={(text, record) => (
            <>
              <Button onClick={() => openEditModal(record)}>Chỉnh sửa</Button>
              <Button type="danger" onClick={() => deleteFlower(record.flowerId)} style={{ marginLeft: 10 }}>
                Xóa
              </Button>
            </>
          )}
        />
      </Table>

      <Modal
        title="Chỉnh sửa thông tin hoa"
        visible={isModalVisible}
        onOk={updateFlower} // Không cần truyền tham số
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Tên hoa"
          value={updatedFlower.flowerName}
          onChange={(e) => setUpdatedFlower({ ...updatedFlower, flowerName: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Số lượng"
          type="number"
          value={updatedFlower.quantity}
          onChange={(e) => setUpdatedFlower({ ...updatedFlower, quantity: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Trạng thái"
          value={updatedFlower.status}
          onChange={(e) => setUpdatedFlower({ ...updatedFlower, status: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Tình trạng"
          value={updatedFlower.condition}
          onChange={(e) => setUpdatedFlower({ ...updatedFlower, condition: e.target.value })}
          style={{ marginBottom: 10 }}
        />
      </Modal>
    </>
  );
};

export default QuanLiHoa;
