import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Spin } from 'antd';
import api from '../../config/axios';
import { Notification, notifySuccess, notifyError } from '../../component/alert';

const { Option } = Select;

const Address = () => {
    const [form] = Form.useForm();
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedDistrictName, setSelectedDistrictName] = useState('');
    const [selectedWardName, setSelectedWardName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

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
            notifyError('Không thể lấy thông tin địa chỉ. Vui lòng thử lại sau.');
        }
    };

    const fetchDistricts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('Shipping/districts?provinceId=202');
            setDistricts(response.data);
        } catch (error) {
            console.error('Error fetching districts:', error);
            notifyError('Không thể lấy danh sách quận/huyện. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWards = async (districtId) => {
        setIsLoadingWards(true);
        try {
            const response = await api.get(`Shipping/wards?district_id=${districtId}`);
            setWards(response.data);
        } catch (error) {
            console.error('Error fetching wards:', error);
            notifyError('Không thể lấy danh sách phường/xã. Vui lòng thử lại sau.');
        } finally {
            setIsLoadingWards(false);
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
        setIsSubmitting(true);
        try {
            const data = {
                Address: values.address,
                WardCode: selectedWard,
                DistrictId: parseInt(selectedDistrict)
            };
    
            console.log('Data being sent:', data);
    
            await api.put('/Users/address', data);
            notifySuccess('Địa chỉ đã được cập nhật thành công');
        } catch (error) {
            console.error('Error updating address:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                notifyError(errorMessages.join(', '));
            } else {
                notifyError('Có lỗi xảy ra khi cập nhật địa chỉ');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Notification />
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Địa chỉ của bạn</h2>
            <Form form={form} onFinish={onFinish} layout="vertical" className="space-y-4">
                <Form.Item 
                    name="district" 
                    label="Quận/Huyện" 
                    rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                >
                    <Select 
                        onChange={handleDistrictChange}
                        className="w-full"
                        loading={isLoading}
                        disabled={isLoading}
                        placeholder={isLoading ? "Đang tải quận/huyện..." : "Chọn quận/huyện"}
                    >
                        {districts.map(district => (
                            <Option key={district.districtId} value={district.districtId}>
                                {district.districtName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item 
                    name="ward" 
                    label="Phường/Xã" 
                    rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                >
                    <Select 
                        onChange={handleWardChange} 
                        disabled={!selectedDistrict || isLoadingWards}
                        className="w-full"
                        loading={isLoadingWards}
                        placeholder={isLoadingWards ? "Đang tải phường/xã..." : "Chọn phường/xã"}
                    >
                        {wards.map(ward => (
                            <Option key={ward.wardCode} value={ward.wardCode}>
                                {ward.wardName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item 
                    name="address" 
                    label="Địa chỉ cụ thể" 
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
                >
                    <Input className="w-full p-2 border border-gray-300 rounded" />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật địa chỉ'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Address;
