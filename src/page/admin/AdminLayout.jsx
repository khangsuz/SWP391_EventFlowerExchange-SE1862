import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

const AdminLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Sider collapsible>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/admin/dashboard">Bảng điều khiển</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<TeamOutlined />}>
            <Link to="/admin/quanlinhanvien">Quản lý nhân viên</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<CustomerServiceOutlined />}>
            <Link to="/admin/quanlikhachhang">Quản lý khách hàng</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<ShopOutlined />}>
            <Link to="/admin/quanlisanpham">Quản lý sản phẩm</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<ShopOutlined />}>
            <Link to="/admin/quanlidonhang">Quản lý đơn hàng</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background p-0">
          <h2 className="text-center">Admin Dashboard</h2>
        </Header>
        <Content className="m-4">
          <h3 className="text-center mb-5">Chào mừng trở lại</h3>
          <Outlet /> {/* Đây là nơi các trang con sẽ được render */}
        </Content>
        <Footer className="text-center">
          Copyright ©{new Date().getFullYear()} Nền Tảng Thanh Lí Hoa Sau Sự Kiện
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;