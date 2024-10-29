import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Upload, message as antMessage, Select } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { beforeUpload, getFullImageUrl } from '../../utils/imageHelpers';

const CreateOrderForm = ({ open, onClose, onSubmit, buyerId, sellerId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const values = await form.validateFields();
      
      if (!fileList.length || !fileList[0]) {
        antMessage.error('Vui lòng tải lên hình ảnh');
        return;
      }

      const formData = new FormData();
      formData.append('BuyerId', buyerId);
      formData.append('SellerId', sellerId);
      formData.append('FlowerName', values.flowerName);
      formData.append('Price', values.price);
      formData.append('Quantity', values.quantity);
      formData.append('Condition', values.condition || 'New');
      formData.append('CategoryId', values.categoryId);
      
      const file = fileList[0].originFileObj || fileList[0];
      formData.append('Image', file);

      console.log('Form data before submit:', {
        flowerName: values.flowerName,
        price: values.price,
        quantity: values.quantity,
        condition: values.condition,
        categoryId: values.categoryId,
        hasImage: !!file
      });

      const success = await onSubmit(formData);
      if (success) {
        handleReset();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      antMessage.error('Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setImageUrl('');
    setFileList([]);
  };

  const handleChange = async (info) => {
    const file = info.fileList[0]?.originFileObj || info.file;
    if (!file) return;

    try {
      setLoading(true);
      
      if (!beforeUpload(file)) {
        setFileList([]);
        setImageUrl('');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      setFileList([file]);

    } catch (error) {
      console.error('Error processing image:', error);
      antMessage.error('Lỗi xử lý ảnh: ' + error.message);
      setImageUrl('');
      setFileList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      title="Tạo đơn hàng tùy chỉnh"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isSubmitting || loading}
      okText="Tạo đơn"
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          quantity: 1,
          condition: 'New'
        }}
      >
        <Form.Item
          name="flowerName"
          label="Tên hoa"
          rules={[{ required: true, message: 'Vui lòng nhập tên hoa' }]}
        >
          <Input placeholder="Nhập tên hoa" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select placeholder="Chọn danh mục">
            <Select.Option value={1}>Hoa sinh nhật</Select.Option>
            <Select.Option value={3}>Hoa chúc mừng</Select.Option>
            <Select.Option value={4}>Hoa khai trương</Select.Option>
            <Select.Option value={5}>Hoa đám cưới</Select.Option>
            <Select.Option value={6}>Hoa kỉ niệm</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá"
          rules={[
            { required: true, message: 'Vui lòng nhập giá' },
            { type: 'number', min: 0, message: 'Giá không thể là số âm' }
          ]}
        >
          <InputNumber
            className="w-full"
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập giá"
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
          ]}
        >
          <InputNumber
            className="w-full"
            min={1}
            placeholder="Nhập số lượng"
          />
        </Form.Item>

        <Form.Item
          name="condition"
          label="Tình trạng"
          rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
        >
          <Select placeholder="Chọn tình trạng">
            <Select.Option value="New">Mới</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="image"
          label="Hình ảnh"
          rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh' }]}
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) return e;
            return e?.fileList || [];
          }}
        >
          <Upload
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleChange}
            maxCount={1}
            accept="image/*"
            fileList={fileList}
          >
            {imageUrl ? (
              <div className="relative w-full h-full">
                <img 
                  src={imageUrl} 
                  alt="preview" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Image loading error');
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <LoadingOutlined className="text-white text-2xl" />
                  </div>
                )}
              </div>
            ) : (
              <div>
                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div className="mt-2">Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateOrderForm;
