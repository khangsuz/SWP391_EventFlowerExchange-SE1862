import React, { useEffect, useState } from "react";
import { Layout, Breadcrumb, Card, Col, Row, Statistic, Spin } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"; 
import PrivateRoute from "../../component/private-route";
import axios from "axios";

const { Header, Content, Footer } = Layout;

const App = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderStatsData, setOrderStatsData] = useState([]);
  const [dailyIncomeData, setDailyIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch tổng thu nhập, số đơn hàng và số sản phẩm từ API
  const fetchDashboardStats = async (token) => {
    try {
      const response = await axios.get('https://localhost:7288/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      setTotalIncome(response.data.totalIncome);
      setOrderCount(response.data.totalOrders);
      setProductCount(response.data.totalProducts);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Lỗi khi tải dữ liệu dashboard.");
    }
  };

  // Hàm fetch dữ liệu thu nhập hàng ngày
  const fetchDailyIncome = async (token) => {
    try {
      const response = await axios.get('https://localhost:7288/api/admin/dashboard/income', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      setDailyIncomeData(processDailyIncomeData(response.data));
    } catch (error) {
      console.error("Error fetching daily income:", error);
      setError("Lỗi khi tải dữ liệu thu nhập hàng ngày.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        await Promise.all([
          fetchDashboardStats(token),
          fetchDailyIncome(token),
          fetchOrderStats(token) // Fetch dữ liệu thống kê đơn hàng
        ]);
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
        <Header style={{ padding: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0, 21, 41, 0.1)' }}>
        <Breadcrumb items={[{ title: 'Admin' }, { title: 'Dashboard' }]} style={{ padding: 24, minHeight: 360 }}/>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <div style={{ padding: 24, minHeight: 360, background: '#f0f2f5' }}>
            <PrivateRoute>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {loading ? (
                <Spin />
              ) : (
                <>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Tổng doanh thu"
                          value={totalIncome}
                          valueStyle={{ color: '#3f8600' }}
                          precision={2}
                          prefix="VNĐ"
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Số đơn hàng"
                          value={orderCount}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Tổng sản phẩm hiện có"
                          value={productCount}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <h2 style={{ marginTop: "24px" }}>Biểu đồ thu nhập hàng ngày</h2>
                  <LineChart
                    width={1100}
                    height={400}
                    data={dailyIncomeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>

                  <h2 style={{ marginTop: "24px" }}>Biểu đồ thống kê đơn hàng theo thời gian</h2>
                  <LineChart
                    width={800}
                    height={400}
                    data={orderStatsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </>
              )}
            </PrivateRoute>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;