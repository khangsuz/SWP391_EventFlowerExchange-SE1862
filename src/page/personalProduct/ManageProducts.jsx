import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { getFullImageUrl } from "../../utils/imageHelpers";
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

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get(`Flowers/seller/${userId}`);
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
      console.log("Categories fetched:", response.data);
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      notification.error({ message: 'Không thể tải danh sách danh mục' });
    }
  }, []);

  const handleDelete = async (flowerId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await api.delete(`Flowers/${flowerId}`);
        setProducts(products.filter((product) => product.flowerId !== flowerId));
        notification.success({ message: 'Xóa sản phẩm thành công' });
      } catch (err) {
        console.error("Error deleting product:", err);
        notification.error({ message: 'Xóa sản phẩm thất bại' });
      }
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsModalVisible(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setCurrentProduct(prev => ({ ...prev, categoryId: value }));
  };

  const handleEditSubmit = async () => {
    
    try {
      await api.put(`Flowers/${currentProduct.flowerId}`, currentProduct);
      setProducts(products.map(product => 
        product.flowerId === currentProduct.flowerId ? currentProduct : product
      ));
      notification.success({ message: 'Chỉnh sửa sản phẩm thành công' });
      setIsModalVisible(false);
    } catch (err) {
      console.error("Error updating product:", err);
      notification.error({ message: 'Chỉnh sửa sản phẩm thất bại' });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
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
                  <p>Số lượng: {product.quantity}</p> 
                  <p>Trạng thái: {product.status}</p>
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

        {/* Modal for Editing Product */}
        <Modal
          title="Chỉnh sửa sản phẩm"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleEditSubmit}>
              Lưu
            </Button>
          ]}
        >
          {currentProduct && (
            <div>
              <Input
                placeholder="Tên sản phẩm"
                name="flowerName"
                value={currentProduct.flowerName}
                onChange={handleEditChange}
              />
              <Input
                placeholder="Giá"
                name="price"
                type="number"
                value={currentProduct.price}
                onChange={handleEditChange}
                style={{ marginTop: '10px' }}
              />
              <Input
                placeholder="Số lượng"
                name="quantity"
                type="number"
                value={currentProduct.quantity}
                onChange={handleEditChange}
                style={{ marginTop: '10px' }}
              />
              <Select
                placeholder="Chọn danh mục"
                value={currentProduct.categoryId}
                onChange={handleCategoryChange}
                style={{ width: '100%', marginTop: '10px' }}
              >
                {categories.map(category => (
                  <Option key={category.categoryId} value={category.categoryName}>
                    {category.categoryName}
                  </Option>
                ))}
              </Select>
              <Input
                placeholder="Trạng thái"
                name="status"
                value={currentProduct.status}
                onChange={handleEditChange}
                style={{ marginTop: '10px' }}
              />
              <Input
                placeholder="URL hình ảnh"
                name="imageUrl"
                value={currentProduct.imageUrl}
                onChange={handleEditChange}
                style={{ marginTop: '10px' }}
              />
            </div>
          )}
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default ManageProducts;
