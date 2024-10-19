import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { getFullImageUrl } from "../../utils/imageHelpers";
import { Modal, Input, Button, Select, notification } from "antd";
import { Notification, notifySuccess, notifyError } from "../../component/alert";

const { Option } = Select;

const ManageProducts = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    flowerName: '',
    price: '',
    quantity: '',
    status: '',
    category: '',
    imageUrl: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get(`Flowers/manage/${userId}`);
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      notification.error({ message: 'Không thể tải danh sách sản phẩm' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('Flowers/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      notifyError({ message: 'Không thể tải danh sách danh mục' });
    }
  }, []);

  const handleDelete = async (flowerId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await api.delete(`Flowers/${flowerId}`);
        setProducts(products.filter((product) => product.flowerId !== flowerId));
        notifySuccess({ message: 'Xóa sản phẩm thành công' });
      } catch (err) {
        console.error("Error deleting product:", err);
        notifyError({ message: 'Xóa sản phẩm thất bại' });
      }
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setUpdatedProduct({
      flowerName: product.flowerName,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
      category: product.categoryName,
      imageUrl: product.imageUrl,
    });
    setIsModalVisible(true);
  };

  const updateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('FlowerName', updatedProduct.flowerName);
      formData.append('Price', updatedProduct.price);
      formData.append('Quantity', updatedProduct.quantity);
      formData.append('Status', updatedProduct.status);
      formData.append('Category', updatedProduct.category);
  
      if (updatedProduct.imageUrl instanceof File) {
        formData.append('image', updatedProduct.imageUrl);
      }
  
      const response = await api.put(`Flowers/${currentProduct.flowerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 204) {
        await fetchProducts();
        setIsModalVisible(false);
        notifySuccess({ message: 'Cập nhật sản phẩm thành công!' });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      notifyError({ message: 'Cập nhật sản phẩm thất bại!' });
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedProduct({ ...updatedProduct, imageUrl: file });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <Notification />
    <Header />
      <div className="container mx-auto py-24">
        <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm của bạn</h1>
        <button
          onClick={() => navigate(`/personal-product/${userId}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 mr-2"
        >
          Quay về xem shop
        </button>
        <button 
          onClick={() => navigate(`/manage-product`)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Tạo Sản Phẩm Mới
        </button>
        
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.flowerId} className="flex items-center border p-4 rounded-lg shadow-md">
                <img
                  src={getFullImageUrl(product.imageUrl)}
                  alt={product.flowerName}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h2 className="font-bold">{product.flowerName}</h2>
                  <p>Giá: {product.price} VNĐ</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => openEditModal(product)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.flowerId)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Không có sản phẩm nào để quản lý.</p>
          )}
        </div>
      </div>

      <Modal
        title="Chỉnh sửa thông tin hoa"
        open={isModalVisible}
        onOk={updateProduct}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Tên hoa"
          value={updatedProduct.flowerName}
          onChange={(e) => setUpdatedProduct({ ...updatedProduct, flowerName: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Giá"
          type="number"
          value={updatedProduct.price}
          onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Số lượng"
          type="number"
          value={updatedProduct.quantity}
          onChange={(e) => setUpdatedProduct({ ...updatedProduct, quantity: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Trạng thái"
          value={updatedProduct.status}
          onChange={(e) => setUpdatedProduct({ ...updatedProduct, status: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Select
          placeholder="Chọn danh mục"
          value={updatedProduct.category}
          onChange={(value) => setUpdatedProduct({ ...updatedProduct, category: value })}
          style={{ marginBottom: 10, width: '100%' }}
        >
          {categories.map((category) => (
            <Option key={category.id} value={category.categoryName}>
              {category.categoryName}
            </Option>
          ))}
        </Select>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: 10 }}
        />
        {updatedProduct.imageUrl && (
          <img
            src={typeof updatedProduct.imageUrl === 'string' ? updatedProduct.imageUrl : URL.createObjectURL(updatedProduct.imageUrl)}
            alt="Preview"
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px' }}
          />
        )}
      </Modal>

      <Footer />
    </>
  );
};

export default ManageProducts;