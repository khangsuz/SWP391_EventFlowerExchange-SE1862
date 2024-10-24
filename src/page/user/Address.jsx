import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import api from '../../config/axios';

const { Option } = Select;

const Address = () => {
    const [form] = Form.useForm();
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedDistrictName, setSelectedDistrictName] = useState('');
    const [selectedWardName, setSelectedWardName] = useState('');

    useEffect(() => {
        fetchUserAddress();
        fetchDistricts();
    }, []);

    const fetchUserAddress = async () => {
        try {
            const response = await api.get('/Users/profile');
            const userData = response.data;
            form.setFieldsValue({
                fullName: userData.fullName,
                phone: userData.phone,
                address: userData.address,
                district: userData.districtId,
                ward: userData.wardCode
            });
            setSelectedDistrict(userData.districtId);
            setSelectedWard(userData.wardCode);
            if (userData.districtId) {
                fetchWards(userData.districtId);
            }
        } catch (error) {
            console.error('Error fetching user address:', error);
            message.error('Không thể lấy thông tin địa chỉ. Vui lòng thử lại sau.');
        }
    };

    const fetchDistricts = async () => {
        try {
            const response = await api.get('Shipping/districts?provinceId=202');
            setDistricts(response.data);
        } catch (error) {
            console.error('Error fetching districts:', error);
            message.error('Không thể lấy danh sách quận/huyện. Vui lòng thử lại sau.');
        }
    };

    const fetchWards = async (districtId) => {
        try {
            const response = await api.get(`Shipping/wards?district_id=${districtId}`);
            setWards(response.data);
        } catch (error) {
            console.error('Error fetching wards:', error);
            message.error('Không thể lấy danh sách phường/xã. Vui lòng thử lại sau.');
        }
    };

    const handleDistrictChange = (value) => {
        setSelectedDistrict(value);
        const district = districts.find(d => d.districtId === parseInt(value));
        if (district) {
            setSelectedDistrictName(district.districtName);
        }
        setSelectedWard(null);
        form.setFieldsValue({ ward: undefined });
        fetchWards(value);
    };

    const handleWardChange = (value) => {
        setSelectedWard(value);
        const selectedWardData = wards.find(ward => ward.wardCode === value);
        if (selectedWardData) {
            setSelectedWardName(selectedWardData.wardName);
        }
    };

    const onFinish = async (values) => {
        try {
            const data = {
                Name: values.name,
                FullName: values.fullName,
                Phone: values.phone,
                Address: values.address,
                WardCode: selectedWard,
                DistrictId: parseInt(selectedDistrict)
            };
    
            console.log('Data being sent:', data);
    
            const response = await api.put('/Users/profile', data);
            message.success('Địa chỉ đã được cập nhật thành công');
        } catch (error) {
            console.error('Error updating address:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                message.error(errorMessages.join(', '));
            } else {
                message.error('Có lỗi xảy ra khi cập nhật địa chỉ');
            }
        }
    };

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}>
                <Select onChange={handleDistrictChange}>
                    {districts.map(district => (
                        <Option key={district.districtId} value={district.districtId}>{district.districtName}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}>
                <Select onChange={handleWardChange} disabled={!selectedDistrict}>
                    {wards.map(ward => (
                        <Option key={ward.wardCode} value={ward.wardCode}>{ward.wardName}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}>
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Cập nhật địa chỉ</Button>
            </Form.Item>
        </Form>
    );
};

export default Address;
