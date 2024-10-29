import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, message, Space, Tag, Card, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const { Title } = Typography;
const { Column } = Table;
const { Option } = Select;

const QuanLiBaoCao = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportStatus, setReportStatus] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Sửa đường dẫn API - bỏ /api ở đầu vì trong axios config đã có baseURL
      const response = await api.get('/Orders/reports');
      if (response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Lỗi khi tải dữ liệu báo cáo');
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

  const handleUpdateReportStatus = async () => {
    try {
      if (!selectedReport?.reportId) {
        message.error('Không tìm thấy thông tin báo cáo');
        return;
      }
      // Sửa đường dẫn API - bỏ /api ở đầu
      await api.put(`/Orders/reports/${selectedReport.reportId}`, {
        status: reportStatus
      });
      message.success('Cập nhật trạng thái báo cáo thành công');
      setIsReportModalVisible(false);
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      message.error('Lỗi khi cập nhật trạng thái báo cáo');
    }
  };

  const showReportModal = (report) => {
    // Kiểm tra nếu báo cáo đã được giải quyết
    if (report.status === 'resolved') {
      message.warning('Không thể cập nhật báo cáo đã giải quyết');
      return;
    }
    setSelectedReport(report);
    setReportStatus(report.status);
    setIsReportModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'processing':
        return 'blue';
      case 'resolved':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'resolved':
        return 'Đã giải quyết';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>
          <Space>
            <ExclamationCircleOutlined />
            Quản lý báo cáo từ khách hàng
          </Space>
        </Title>

        <Table
          dataSource={reports}
          rowKey="reportId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} báo cáo`
          }}
        >
          <Column 
            title="ID" 
            dataIndex="reportId" 
            width={80} 
            sorter={(a, b) => a.reportId - b.reportId}
          />
          <Column 
            title="Mã đơn hàng" 
            dataIndex="orderId" 
            width={100}
            sorter={(a, b) => a.orderId - b.orderId}
          />
          <Column 
            title="Người báo cáo" 
            dataIndex="userName" 
            width={150}
            sorter={(a, b) => a.userName.localeCompare(b.userName)}
          />
          <Column 
            title="Nội dung" 
            dataIndex="content" 
            ellipsis={{ showTitle: true }} 
          />
          <Column 
            title="Ngày tạo" 
            dataIndex="createdAt" 
            width={150}
            render={(text) => formatDate(text)}
            sorter={(a, b) => new Date(a.createdAt) - new Date(b.createdAt)}
          />
          <Column 
            title="Trạng thái đơn hàng" 
            dataIndex="orderStatus" 
            width={140}
            render={(status) => (
              <Tag color={status === 'Completed' ? 'green' : 'blue'}>
                {status}
              </Tag>
            )}
          />
          <Column 
            title="Trạng thái báo cáo" 
            dataIndex="status" 
            width={140}
            render={(status) => (
              <Tag color={getStatusColor(status)}>
                {getStatusText(status)}
              </Tag>
            )}
            filters={[
              { text: 'Chờ xử lý', value: 'pending' },
              { text: 'Đã giải quyết', value: 'resolved' }
            ]}
            onFilter={(value, record) => record.status === value}
          />
          <Column 
            title="Hành động" 
            key="action"
            width={120}
            fixed="right"
            render={(_, record) => (
              <Button
                type="primary"
                onClick={() => showReportModal(record)}
                disabled={record.status === 'resolved'}
              >
                Cập nhật
              </Button>
            )} 
          />
        </Table>

        <Modal
          title="Cập nhật trạng thái báo cáo"
          open={isReportModalVisible}
          onOk={handleUpdateReportStatus}
          onCancel={() => setIsReportModalVisible(false)}
        >
          <Form layout="vertical">
            <Form.Item 
              label="Trạng thái"
              required
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select
                value={reportStatus}
                onChange={setReportStatus}
                style={{ width: '100%' }}
              >
                <Option value="pending">Chờ xử lý</Option>
                <Option value="processing">Đang xử lý</Option>
                <Option value="resolved">Đã giải quyết</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default QuanLiBaoCao;
