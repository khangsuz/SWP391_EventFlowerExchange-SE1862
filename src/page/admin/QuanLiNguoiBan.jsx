import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Card, Space, Input, Tag, Typography, Row, Col, Statistic } from 'antd';
import { UserOutlined, ShopOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Search } = Input;

const API_URL = 'https://localhost:7288/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const QuanLiNguoiBan = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No token found');
            }

            const response = await api.get('/SellerRegistration', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (Array.isArray(response.data)) {
                setRequests(response.data);
            } else {
                console.error('Unexpected data format:', response.data);
                message.error('Dữ liệu không hợp lệ');
            }
        } catch (error) {
            console.error('Error fetching seller requests:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            message.error('Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (approved) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No token found');
            }
    
            // Cập nhật trạng thái yêu cầu
            await api.put(`/SellerRegistration/${currentRequestId}`, { 
                approved: approved
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (approved) {
                try {
                    await api.put(`/Users/${currentUserId}/usertype`, 'Seller', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (userUpdateError) {
                    console.error('Error updating user type:', userUpdateError);
                    message.warning('Yêu cầu đã được phê duyệt, nhưng có lỗi khi cập nhật thông tin người dùng. Vui lòng kiểm tra lại.');
                }
            }
    
            message.success(approved ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu');
            setModalVisible(false);
            await fetchRequests();
        } catch (error) {
            console.error('Error processing seller request:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            message.error('Có lỗi xảy ra khi xử lý yêu cầu');
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'Pending':
                return <Tag icon={<ExclamationCircleOutlined />} color="warning">Đang chờ</Tag>;
            case 'Approved':
                return <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt</Tag>;
            case 'Rejected':
                return <Tag icon={<CloseCircleOutlined />} color="error">Đã từ chối</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    const columns = [
        { 
            title: 'User ID', 
            dataIndex: 'userId', 
            key: 'userId',
            width: 100 
        },
        { 
            title: 'Tên cửa hàng', 
            dataIndex: 'storeName', 
            key: 'storeName',
            width: 200,
            render: (text) => (
                <Space>
                    <ShopOutlined />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        { 
            title: 'Email', 
            dataIndex: 'email', 
            key: 'email',
            width: 200
        },
        { 
            title: 'Địa chỉ', 
            dataIndex: 'address', 
            key: 'address',
            width: 250,
            ellipsis: true
        },
        { 
            title: 'Số điện thoại', 
            dataIndex: 'phone', 
            key: 'phone',
            width: 150
        },
        { 
            title: 'CMND/CCCD', 
            dataIndex: 'idCard', 
            key: 'idCard',
            width: 150
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            width: 150,
            render: (status) => getStatusTag(status)
        },
        { 
            title: 'Ngày yêu cầu', 
            dataIndex: 'requestDate', 
            key: 'requestDate', 
            render: (text) => {
              const date = new Date(text);
              // Chuyển đổi thời gian UTC sang múi giờ Việt Nam
              const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // Thêm 7 giờ
              return vietnamTime.toLocaleString('vi-VN', { 
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
            }
          },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                record.status === 'Pending' && (
                    <Button 
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => showApprovalModal(record.requestId, record.userId)}
                    >
                        Xử lý
                    </Button>
                )
            ),
        },
    ];

    const showApprovalModal = (requestId, userId) => {
        setCurrentRequestId(requestId);
        setCurrentUserId(userId);
        setModalVisible(true);
    };

    const filteredRequests = requests.filter(request => {
        const searchLower = searchText.toLowerCase();
        return (
            request.storeName?.toLowerCase().includes(searchLower) ||
            request.email?.toLowerCase().includes(searchLower) ||
            request.address?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="admin-seller-requests" style={{ padding: '24px' }}>
            <Card className="page-header">
                <Title level={2}>
                    <Space>
                        <ShopOutlined />
                        Quản Lý Đăng Ký Người Bán
                    </Space>
                </Title>
            </Card>

            <Card style={{ marginTop: '16px' }}>
                <Space style={{ marginBottom: '16px' }}>
                    <Search
                        placeholder="Tìm kiếm theo tên cửa hàng, email hoặc địa chỉ..."
                        style={{ width: 400 }}
                        allowClear
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button 
                        icon={<ReloadOutlined />}
                        onClick={fetchRequests}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredRequests}
                    loading={loading}
                    rowKey="requestId"
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} yêu cầu`
                    }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined />
                        Xử lý yêu cầu đăng ký
                    </Space>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button 
                        key="reject" 
                        danger 
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleApprove(false)}
                    >
                        Từ chối
                    </Button>,
                    <Button 
                        key="approve" 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(true)}
                    >
                        Phê duyệt
                    </Button>
                ]}
            >
                <p>Bạn có chắc chắn muốn xử lý yêu cầu này?</p>
            </Modal>

            <style jsx>{`
                .page-header {
                    background: #fff;
                    margin-bottom: 16px;
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                }
                .ant-card {
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                }
                .ant-table-thead > tr > th {
                    background: #fafafa;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default QuanLiNguoiBan;