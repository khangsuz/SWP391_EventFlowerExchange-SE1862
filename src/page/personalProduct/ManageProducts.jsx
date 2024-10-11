import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { Modal, Input, Button, Select, notification } from "antd";

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

  const fetchProducts = async () => {
    try {
      const response = await api.get(`Flowers/seller/${userId}`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('Flowers/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleDelete = async (flowerId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await api.delete(`Flowers/${flowerId}`);
        setProducts(products.filter((product) => product.flowerId !== flowerId));
      } catch (err) {
        console.error("Error deleting product:", err);
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
      formData.append("flowerName", updatedProduct.flowerName);
      formData.append("price", updatedProduct.price);
      formData.append("quantity", updatedProduct.quantity);
      formData.append("status", updatedProduct.status);
      formData.append("category", updatedProduct.category);
      if (updatedProduct.imageUrl instanceof File) {
        formData.append("imageUrl", updatedProduct.imageUrl);
      }

      await api.put(`Flowers/${currentProduct.flowerId}`, formData);

      fetchProducts();
      setIsModalVisible(false);
      notification.success({ message: 'Cập nhật sản phẩm thành công!' });
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      notification.error({ message: 'Cập nhật sản phẩm thất bại!' });
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedProduct({ ...updatedProduct, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm của bạn</h1>
        <button
          onClick={() => navigate(`/personal-product/${userId}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
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
                  src={product.imageUrl}
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
        visible={isModalVisible}
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
            src={updatedProduct.imageUrl}
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