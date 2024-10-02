import React, { useEffect, useState } from "react";
import { Table, Spin, message } from 'antd';
import { DesktopOutlined, FileOutlined, PieChartOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { useLocation } from "react-router-dom";
import PrivateRoute from "../../component/private-route";
import axios from "axios";

const { Header, Content, Footer, Sider } = Layout;
const { Column } = Table;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const items = [
  getItem("Quản lý người dùng", "1", <UserOutlined />),
  getItem("Quản lý hoa", "2", <PieChartOutlined />),
  getItem("Quản lý đơn hàng", "3", <DesktopOutlined />),
  getItem("Thông báo", "4", <TeamOutlined />),
  getItem("Tài liệu", "5", <FileOutlined />),
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [users, setUsers] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token admin
  const adminToken = "your-admin-token-here"; // Thay thế bằng token của bạn

  // Hàm fetch người dùng với timeout
  const fetchUsers = async (token) => {
    try {
      const response = await axios.get('https://localhost:7288/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // Thời gian chờ là 5 giây
      });
      console.log("Fetched Users Response: ", response.data);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Lỗi khi tải dữ liệu người dùng."); // Ghi nhận lỗi
    }
  };

  // Hàm fetch hoa với timeout
  const fetchFlowers = async (token) => {
    try {
      const response = await axios.get('https://localhost:7288/api/admin/flowers', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // Thời gian chờ là 5 giây
      });
      console.log("Fetched Flowers Response: ", response.data);
      setFlowers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching flowers:", error);
      setError("Lỗi khi tải dữ liệu hoa."); // Ghi nhận lỗi
    }
  };

  // Hàm fetch đơn hàng với timeout
  const fetchOrders = async (token) => {
    try {
      const response = await axios.get('https://localhost:7288/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // Thời gian chờ là 5 giây
      });
      console.log("Fetched Orders Response: ", response.data);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Lỗi khi tải dữ liệu đơn hàng."); // Ghi nhận lỗi
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      if (token) {
        await Promise.all([fetchUsers(token), fetchFlowers(token), fetchOrders(token)]);
      } else {
        setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb items={[{ title: 'Admin' }, { title: 'Quản lý' }]} />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <PrivateRoute>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {loading ? (
                <Spin />
              ) : (
                <>
                  <h2>Quản lý người dùng</h2>
                  <Table dataSource={users} rowKey="userId">
                    <Column title="ID" dataIndex="userId" key="userId" />
                    <Column title="Tên người dùng" dataIndex="name" key="name" />
                    <Column title="Email" dataIndex="email" key="email" />
                    <Column title="Vai trò" dataIndex="userType" key="userType" />
                    <Column title="Số điện thoại" dataIndex="phone" key="phone" />
                    <Column title="Địa chỉ" dataIndex="address" key="address" />
                    <Column title="Ngày đăng ký" dataIndex="registrationDate" key="registrationDate" render={(date) => new Date(date).toLocaleDateString()} />
                  </Table>

                  <h2>Quản lý hoa</h2>
                  <Table dataSource={flowers} rowKey="flowerId">
                    <Column title="ID" dataIndex="flowerId" key="flowerId" />
                    <Column title="Tên hoa" dataIndex="flowerName" key="flowerName" />
                    <Column title="Người bán" dataIndex="userId" key="userId" />
                    <Column title="Số lượng" dataIndex="quantity" key="quantity" />
                    <Column title="Trạng thái" dataIndex="status" key="status" />
                  </Table>

                  <h2>Quản lý đơn hàng</h2>
                  <Table dataSource={orders} rowKey="orderId">
                    <Column title="ID" dataIndex="orderId" key="orderId" />
                    <Column title="Người mua" dataIndex="userId" key="userId" />
                    <Column title="Ngày đặt hàng" dataIndex="orderDate" key="orderDate" />
                    <Column title="Trạng thái" dataIndex="orderStatus" key="orderStatus" />
                    <Column title="Địa chỉ giao hàng" dataIndex="deliveryAddress" key="deliveryAddress" />
                  </Table>
                </>
              )}
            </PrivateRoute>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
