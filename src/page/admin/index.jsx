import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Dropdown, Menu, Card, Col, Row, Layout, Table } from 'antd';
import {
  DashboardOutlined,
  IdcardOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  ProductOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  

  const dataSource = [
    { key: 1, name: "Hoa Hồng", quantity: 22 },
    { key: 2, name: "Hoa Mai", quantity: 10 },
    { key: 3, name: "Hoa Lan", quantity: 7 },
    { key: 4, name: "Hoa Cúc", quantity: 6 },
    { key: 5, name: "Hoa Giấy", quantity: 4 },
  ];

  const columns = [
    { title: 'ID', dataIndex: 'key', key: 'key' },
    { title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Tổng Số Lượng', dataIndex: 'quantity', key: 'quantity' },
  ];

  const menu = (
    <Menu>
      <Menu.Item key="1">Your Profile</Menu.Item>
      <Menu.Item key="2">Settings</Menu.Item>
      <Menu.Item key="3">Sign out</Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
     
      <Layout>
        <Header className="bg-white flex justify-between items-center p-4">
          <Input placeholder="Search..." className="w-1/2" />
          <Dropdown overlay={menu} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
              <UserOutlined className="text-2xl" />
            </a>
          </Dropdown>
        </Header>
        <Content className="m-4">
          <Row gutter={[16, 16]} justify="start" className="mt-5">
            <Col span={16}>
              <Row gutter={[16, 16]} className="h-full">
                {/* Các Card hiển thị thông tin */}
                {[
                  { title: "TỔNG KHÁCH HÀNG", value: 9, icon: "https://cdn-icons-png.flaticon.com/128/8890/8890215.png" },
                  { title: "TỔNG SẢN PHẨM", value: 52, icon: "https://cdn-icons-png.flaticon.com/128/11898/11898499.png" },
                  { title: "TỔNG PHẢN HỒI", value: 65, icon: "https://cdn-icons-png.flaticon.com/128/1632/1632726.png" },
                  { title: "TỔNG ĐƠN HÀNG", value: 65, icon: "https://cdn-icons-png.flaticon.com/128/15321/15321033.png" },
                  { title: "TỔNG THU NHẬP", value: 72459000, icon: "https://cdn-icons-png.flaticon.com/128/10930/10930720.png" },
                  { title: "TỔNG LỢI NHUẬN", value: 218789000, icon: "https://cdn-icons-png.flaticon.com/128/11334/11334720.png" },
                ].map((item, index) => (
                  <Col span={8} key={index}>
                    <Card className="bg-white rounded-lg shadow-md p-4 h-90">
                      <div className="flex items-center justify-start h-full">
                        <img src={item.icon} className="w-12 h-12 mr-4" />
                        <div className="flex-1 text-left">
                          <h4 className="m-0 text-lg font-bold text-red-600">{item.title}</h4>
                          <p className="text-2xl font-bold m-2">{item.value}</p>
                          <p className="text-gray-500">Tổng số {item.title.toLowerCase()}.</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={8}>
              <Card className="h-full rounded-lg shadow-md p-4">
                <h4 className="m-0">BIỂU ĐỒ THỐNG KÊ</h4>
                {/* Thêm mã biểu đồ của bạn ở đây */}
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-5">
            <Col span={24}>
              <Card className="rounded-lg shadow-md p-4">
                <h4 className="m-0">SẢN PHẨM BÁN CHẠY NHẤT</h4>
                <Table dataSource={dataSource} columns={columns} pagination={false} bordered />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;