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
  const menuItems = [
    {
      key: "8", 
      icon: (
        <img 
          src="https://i.postimg.cc/tCjpf50j/Black-and-Pink-Flower-Shop-Logo-1-removebg-preview.png" 
          alt="Logo" 
          style={{ width: '30px', height: '30px', marginRight: '10px' }} 
        />
      ),
      label: (
        <Link to="/" style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '16px' }}>
          Trang Chủ
        </Link>
      ),
    },
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Bảng điều khiển</Link>,
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: <Link to="/admin/QuanLiNguoiDung">Quản lý người dùng</Link>,
    },
    {
      key: "3",
      icon: <ShopOutlined />,
      label: <Link to="/admin/quanlisanpham">Quản lý sản phẩm</Link>,
    },
    {
      key: "4",
      icon: <ShopOutlined />,
      label: <Link to="/admin/quanlidonhang">Quản lý đơn hàng</Link>,
    },
    {
      key: "5",
      icon: <ShopOutlined />,
      label: <Link to="/admin/quanlinguoiban">Quản lý người bán</Link>,
    },
    {
      key: "6",
      icon: <ShopOutlined />,
      label: <Link to="/admin/WithdrawalRequests">Quản lý rút tiền</Link>,
    },
    {
      key: "7",
      icon: <CustomerServiceOutlined />,
      label: <Link to="/admin/quanlidanhgia">Quản lý đánh giá</Link>,
    },

  ];

  return (
    <Layout className="min-h-screen">
      <Sider collapsible>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background p-0">
          <h2 className="text-center">Admin Dashboard</h2>
        </Header>
        <Content className="m-4">
          <h3 className="text-center mb-5"></h3>
          <Outlet />
        </Content>
        <Footer className="text-center">
          Copyright ©{new Date().getFullYear()} Nền Tảng Thanh Lí Hoa Sau Sự Kiện
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;