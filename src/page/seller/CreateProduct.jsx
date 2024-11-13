import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import { useNavigate } from 'react-router-dom';
import Header from '../../component/header';
import Footer from '../../component/footer';
import { Form, Input, InputNumber, Select, Upload, Button, message } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';

const CreateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [form] = Form.useForm();
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('Categories');
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/Users/current-user");
        setUserId(response.data.userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCategories();
    fetchCurrentUser();
    return () => {
      imageFile && URL.revokeObjectURL(imageFile.preview);
    };
  }, [imageFile]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Price' || name === 'Quantity') {
      const newValue = value.replace(/^0+/, '');
      setFlower(prevFlower => ({
        ...prevFlower,
        [name]: newValue ? parseFloat(newValue) : 0
      }));
    } else {
      setFlower(prevFlower => ({
        ...prevFlower,
        [name]: value
      }));
    }
  };

  const handleImageChange = ({ file }) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file.originFileObj || file);
      setImageFile({
        file: file.originFileObj || file,
        preview: previewUrl
      });
    }
  };

  const handleSubmit = async (values) => {
    if (!values.FlowerName || values.Quantity <= 0 || !values.CategoryId) {
      message.error('Vui lòng điền đầy đủ thông tin và giá trị hợp lệ.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('FlowerName', values.FlowerName);
      formData.append('Price', values.Price.toString());
      formData.append('Quantity', values.Quantity.toString());
      formData.append('Condition', values.Condition.toString());
      formData.append('CategoryId', values.CategoryId.toString());
      if (imageFile) {
        formData.append('image', imageFile.file);
      }

      const response = await api.post('Flowers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const newFlower = response.data;
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User information not found in localStorage');
        }
        const currentUser = JSON.parse(userString);
        if (!currentUser || !currentUser.userId) {
          throw new Error('Invalid user information');
        }

        await api.post('Notification', {
          Message: `Sản phẩm mới đã được thêm: ${newFlower.flowerName}`,
          NotificationDate: new Date().toISOString(),
          IsRead: false,
          SellerId: currentUser.userId
        });
        message.success('Thông báo đã được tạo thành công');
      } catch (notificationError) {
        console.error("Lỗi khi tạo thông báo:", notificationError.message);
      }

      message.success('Đã tạo sản phẩm thành công');
      navigate(`/manage-products/${userId}`);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response) {
        message.error(`Lỗi: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        message.error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        message.error('Có lỗi xảy ra khi tạo sản phẩm: ' + error.message);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/personal-product/${userId}`)}
            className="mb-8 flex items-center hover:bg-blue-50"
          >
            Quay Về Cửa Hàng
          </Button>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Tạo Sản Phẩm Mới
            </h2>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                FlowerName: '',
                Price: 0,
                Quantity: 1,
                Condition: '',
                CategoryId: ''
              }}
            >
              <Form.Item
                label="Tên Hoa"
                name="FlowerName"
                rules={[{ required: true, message: 'Vui lòng nhập tên hoa' }]}
              >
                <Input placeholder="Nhập tên hoa" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Giá"
                  name="Price"
                  rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    step={1000}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Nhập giá"
                  />
                </Form.Item>

                <Form.Item
                  label="Số lượng"
                  name="Quantity"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    max={50}
                    placeholder="Nhập số lượng"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Tình trạng"
                  name="Condition"
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
                >
                  <Select placeholder="Chọn tình trạng">
                    <Select.Option value="90">90%</Select.Option>
                    <Select.Option value="80">80%</Select.Option>
                    <Select.Option value="70">70%</Select.Option>
                    <Select.Option value="60">60%</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Danh mục"
                  name="CategoryId"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                  <Select
                    placeholder="Chọn danh mục"
                    loading={loading}
                    disabled={loading}
                  >
                    {categories.map(category => (
                      <Select.Option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              {/* Image Upload Section */}
              <div className="mt-8 mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Hình ảnh sản phẩm
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-[400px] h-[400px] relative">
                    {imageFile ? (
                      <div className="w-full h-full relative">
                        <img
                          src={imageFile.preview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg border"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center 
                                      bg-black bg-opacity-50 opacity-0 hover:opacity-100 
                                      transition-opacity rounded-lg">
                          <label className="cursor-pointer text-white text-lg mb-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleImageChange({ file });
                                }
                              }}
                            />
                            Thay đổi
                          </label>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              URL.revokeObjectURL(imageFile.preview);
                              setImageFile(null);
                            }}
                          >
                            Xóa ảnh
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center 
                                     border-2 border-dashed border-gray-300 rounded-lg 
                                     hover:border-blue-500 hover:bg-blue-50 transition-all 
                                     cursor-pointer bg-white relative overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleImageChange({ file });
                            }
                          }}
                        />
                        <div className="text-center pointer-events-none">
                          <UploadOutlined className="text-4xl text-gray-400" />
                          <div className="mt-4">
                            <div className="text-gray-500 text-lg font-medium">Tải ảnh lên</div>
                            <div className="text-gray-400 text-sm mt-2">Định dạng: JPG, PNG</div>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600"
                >
                  Tạo Sản Phẩm
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateProduct;