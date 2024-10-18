import React, { useState, useEffect } from 'react';
import { Table, Select, message } from 'antd';
import { useParams } from 'react-router-dom';
import api from "../../config/axios";

const { Option } = Select;


function SellerOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userId } = useParams(); // Thay đổi từ sellerId sang userId

    useEffect(() => {
        fetchSellerOrders();
    }, [userId]);

    const fetchSellerOrders = async () => {
        try {
            const response = await api.get(`Orders/seller-orders/${userId}`);
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            message.error('Không thể tải danh sách đơn hàng');
            setLoading(false);
        }
    };

    const handleDeliveryStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`Orders/${orderId}/delivery`, { orderDelivery: newStatus, userId });
            message.success('Cập nhật trạng thái giao hàng thành công');
            fetchSellerOrders();
        } catch (error) {
            console.error('Error updating order delivery status:', error);
            message.error('Không thể cập nhật trạng thái giao hàng: ' + (error.response?.data || error.message));
        }
    };


    const columns = [
        { 
            title: 'Mã đơn hàng', 
            dataIndex: 'orderId', 
            key: 'orderId' 
        },
        { 
            title: 'Ngày đặt', 
            dataIndex: 'orderDate', 
            key: 'orderDate', 
            render: (date) => new Date(date).toLocaleDateString() 
        },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount', 
            render: (amount) => `${amount.toLocaleString()}đ` 
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'items',
            key: 'items',
            render: (items) => (
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>{item.flowerName} x {item.quantity}</li>
                    ))}
                </ul>
            )
        },
        {
            title: 'Trạng thái giao hàng',
            dataIndex: 'orderDelivery',
            key: 'orderDelivery',
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    style={{ width: 150 }}
                    onChange={(value) => handleDeliveryStatusChange(record.orderId, value)}
                >
                    <Option value="ChờXửLý">Chờ xử lý</Option>
                    <Option value="ĐangXửLý">Đang xử lý</Option>
                    <Option value="ĐãGửiHàng">Đã gửi hàng</Option>
                    <Option value="ĐãGiaoHàng">Đã giao hàng</Option>
                    <Option value="ĐãHủy">Đã hủy</Option>
                </Select>
            )
        },
    ];

    return (
        <div className="seller-order-management">
            <h1 >Cập nhật trạng thái giao hàng</h1>
            {/* <h1>Quản lý đơn hàng cho Seller {userId}</h1> */}
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="orderId"
                loading={loading}
            />
        </div>
    );
}

export default SellerOrderManagement;