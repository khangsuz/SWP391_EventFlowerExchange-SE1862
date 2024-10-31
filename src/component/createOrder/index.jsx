import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Select, message as antMessage, Space, Button } from 'antd';
import api from '../../config/axios';

const CreateOrderForm = ({ open, onClose, onSubmit, buyerId }) => {
  const [form] = Form.useForm();
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchFlowers = async () => {
      setLoading(true);
      try {
        const response = await api.get(`Flowers/no-price-flowers`);
        setFlowers(response.data);
      } catch (error) {
        console.error('Error fetching flowers:', error);
        antMessage.error('Không thể tải danh sách hoa');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchFlowers();
    }
  }, [open]);

  const handleFlowerSelect = (flowerId) => {
    const flower = flowers.find(f => f.flowerId === flowerId);
    setSelectedFlower(flower);
    form.setFieldValue('quantity', null);
  };

  const handleSubmit = async (values) => {
    try {
      if (!selectedFlower) {
        antMessage.error('Vui lòng chọn hoa');
        return false;
      }

      const quantity = Math.floor(Number(values.quantity));
      const price = Number(values.price);
      
      if (quantity > selectedFlower.quantity) {
        antMessage.error(`Số lượng không được vượt quá ${selectedFlower.quantity}`);
        return false;
      }

      if (quantity < 1) {
        antMessage.error('Số lượng phải lớn hơn 0');
        return false;
      }

      Modal.confirm({
        title: 'Xác nhận tạo đơn hàng',
        content: (
          <div>
            <ul>
              <li><strong>Tên hoa:</strong> {selectedFlower.flowerName}</li>
              <li><strong>Số lượng:</strong> {quantity}</li>
              <li><strong>Đơn Giá:</strong> {price.toLocaleString('vi-VN')} VNĐ</li>
              <li><strong>Tổng tiền:</strong> {(quantity * price).toLocaleString('vi-VN')} VNĐ</li>
            </ul>
          </div>
        ),
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          setConfirmLoading(true);
          try {
            const success = await onSubmit({
              ...values,
              buyerId,
              flowerId: selectedFlower.flowerId,
              quantity: quantity
            });

            if (success) {
              form.resetFields();
              setSelectedFlower(null);
              onClose();
              antMessage.success('Đã tạo đơn hàng thành công');
            }
          } catch (error) {
            console.error('Submit error:', error);
            antMessage.error('Có lỗi xảy ra khi tạo đơn hàng');
          } finally {
            setConfirmLoading(false);
          }
        },
        onCancel() {
        },
      });
    } catch (error) {
      console.error('Submit error:', error);
      antMessage.error('Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  return (
    <Modal
      title="Tạo đơn hàng tùy chỉnh"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="flowerId"
          label="Chọn hoa"
          rules={[{ required: true, message: 'Vui lòng chọn hoa' }]}
        >
          <Select
            loading={loading}
            placeholder="Chọn hoa"
            onChange={handleFlowerSelect}
            optionFilterProp="children"
          >
            {flowers.map(flower => (
              <Select.Option 
                key={flower.flowerId} 
                value={flower.flowerId}
                disabled={flower.quantity <= 0}
              >
                {`${flower.flowerName} - Số lượng: ${flower.quantity} - Ngày đăng: ${
                  flower.listingDate 
                    ? new Date(flower.listingDate).toLocaleDateString('vi-VN') 
                    : 'Chưa xác định'
                }`}
                {flower.quantity <= 0 && ' (Hết hàng)'}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            {
              validator: async (_, value) => {
                if (selectedFlower && value > selectedFlower.quantity) {
                  throw new Error(`Số lượng không được vượt quá ${selectedFlower.quantity}`);
                }
              }
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập số lượng"
            min={1}
            max={selectedFlower?.quantity}
            disabled={!selectedFlower}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá (VNĐ)"
          rules={[
            { required: true, message: 'Vui lòng nhập giá' },
            { type: 'number', min: 1000, message: 'Giá phải lớn hơn 1,000 VNĐ' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập giá"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            min={1000}
            step={100000}
          />
        </Form.Item>

        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button 
              type="primary" 
              htmlType="submit"
              disabled={!selectedFlower || loading}
              loading={confirmLoading}
            >
              Tạo đơn hàng
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateOrderForm;
