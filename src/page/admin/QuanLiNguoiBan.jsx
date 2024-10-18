import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal } from 'antd';
import axios from 'axios';
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

    const columns = [
        { title: 'Tên cửa hàng', dataIndex: 'storeName', key: 'storeName' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'CMND/CCCD', dataIndex: 'idCard', key: 'idCard' }, // Thêm cột mới cho idCard
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
        { title: 'Ngày yêu cầu', dataIndex: 'requestDate', key: 'requestDate', 
          render: (text) => new Date(text).toLocaleString() },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                record.status === 'Pending' && (
                    <Button onClick={() => showApprovalModal(record.requestId, record.userId)}>Xử lý</Button>
                )
            ),
        },
    ];

    const showApprovalModal = (requestId, userId) => {
        setCurrentRequestId(requestId);
        setCurrentUserId(userId);
        setModalVisible(true);
    };

    return (
        <div className="admin-seller-requests">
            <h2>Yêu cầu đăng ký làm người bán</h2>
            <Table
                columns={columns}
                dataSource={requests}
                loading={loading}
                rowKey="requestId"
            />
            <Modal
                title="Xử lý yêu cầu đăng ký"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="reject" onClick={() => handleApprove(false)}>Từ chối</Button>,
                    <Button key="approve" type="primary" onClick={() => handleApprove(true)}>Phê duyệt</Button>
                ]}
            >
                <p>Bạn có chắc chắn muốn xử lý yêu cầu này?</p>
            </Modal>
        </div>
    );
};

export default QuanLiNguoiBan;