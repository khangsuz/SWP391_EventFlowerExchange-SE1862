import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Modal, Input, Select } from 'antd';
import axios from "axios";

const { Column } = Table;
const { confirm } = Modal;
const { Option } = Select;

const QuanLiNguoiDung = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    userType: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get('https://localhost:7288/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      setError("Lỗi khi tải dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a user
  const deleteUser = (userId) => {
    const token = localStorage.getItem("token");
    confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      onOk: async () => {
        try {
          await axios.delete(`https://localhost:7288/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(users.filter(user => user.userId !== userId));
        } catch (error) {
          setError("Lỗi khi xóa người dùng.");
        }
      }
    });
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setUpdatedUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      password: '',
    });
    setIsModalVisible(true);
  };

  const updateUser = async () => {
    const token = localStorage.getItem("token");

    const userToUpdate = {
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      phone: updatedUser.phone,
      address: updatedUser.address,
      password: updatedUser.password || undefined
    };

    try {
      await axios.put(`https://localhost:7288/api/admin/users/${currentUser.userId}`, userToUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Cập nhật danh sách người dùng sau khi thay đổi
      setUsers(users.map(user => user.userId === currentUser.userId ? { ...user, ...userToUpdate } : user));
      setIsModalVisible(false);
    } catch (error) {
      if (error.response) {
        console.log("Error data:", error.response.data);
      }
      setError("Lỗi khi cập nhật thông tin người dùng.");
    }
  };

  if (loading) return <Spin />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <Table dataSource={users} rowKey="userId">
        <Column title="ID" dataIndex="userId" key="userId" />
        <Column title="Tên người dùng" dataIndex="name" key="name" />
        <Column title="Email" dataIndex="email" key="email" />
        <Column title="Vai trò" dataIndex="userType" key="userType" />
        <Column title="Số điện thoại" dataIndex="phone" key="phone" />
        <Column title="Địa chỉ" dataIndex="address" key="address" />
        <Column title="Ngày đăng ký" dataIndex="registrationDate" key="registrationDate" render={(date) => new Date(date).toLocaleDateString()} />
        <Column
          title="Hành động"
          key="actions"
          render={(text, record) => (
            <>
              <Button onClick={() => openEditModal(record)}>Chỉnh sửa</Button>
              <Button type="danger" onClick={() => deleteUser(record.userId)} style={{ marginLeft: 10 }}>
                Xóa
              </Button>
            </>
          )}
        />
      </Table>

      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isModalVisible}
        onOk={updateUser}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Tên người dùng"
          value={updatedUser.name}
          onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Email"
          value={updatedUser.email}
          onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Số điện thoại"
          value={updatedUser.phone}
          onChange={(e) => setUpdatedUser({ ...updatedUser, phone: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Địa chỉ"
          value={updatedUser.address}
          onChange={(e) => setUpdatedUser({ ...updatedUser, address: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input.Password
          placeholder="Mật khẩu (để thay đổi)"
          value={updatedUser.password}
          onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Select
          value={updatedUser.userType}
          onChange={(value) => setUpdatedUser({ ...updatedUser, userType: value })}
          style={{ width: '100%' }}
        >
          <Option value="Admin">Admin</Option>
          <Option value="Seller">Seller</Option>
          <Option value="Buyer">Buyer</Option>
        </Select>
      </Modal>
    </>
  );
};

export default QuanLiNguoiDung;
