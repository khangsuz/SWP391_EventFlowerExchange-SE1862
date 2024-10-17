import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { Modal, Input, Button, Select, notification  } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    condition: '',
    status: '',
    category: '',
    imageUrl: null, 
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
      const response = await api.get('Flowers/categories'); // Lấy danh sách categories từ API
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
      condition: product.condition || '',
      status: product.status,
      category: product.categoryName,
      imageUrl: null, // Đặt lại giá trị hình ảnh
    });
    setIsModalVisible(true);
  };

  const updateProduct = async (productId, productData) => {
    try {
        const formData = new FormData();
        formData.append("flowerName", productData.flowerName);
        formData.append("price", productData.price);
        formData.append("quantity", productData.quantity);
        formData.append("condition", productData.condition || '');
        formData.append("status", productData.status);
        formData.append("category", productData.category);

        if (productData.imageUrl) {
            formData.append("imageUrl", productData.imageUrl);
        }

        const response = await axios.put(`https://localhost:7288/api/Flowers/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Cập nhật sản phẩm thành công:', response.data);
        
        // Hiển thị thông báo thành công
        notification.success({
            message: 'Cập nhật thành công!',
            description: 'Thông tin sản phẩm đã được cập nhật.',
        });
        
        // Cập nhật lại danh sách sản phẩm nếu cần
        fetchProducts(); // Gọi lại hàm fetchProducts để cập nhật danh sách sản phẩm
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error.response?.data || error);
        notification.error({
            message: 'Cập nhật thất bại!',
            description: 'Đã xảy ra lỗi khi cập nhật sản phẩm.',
        });
    }
};



  const handleImageChange = (event) => {
    setUpdatedProduct({ ...updatedProduct, imageUrl: event.target.files[0] });
  };
  const handleCloseEditModal = () => {
    setIsModalVisible(false);
    setCurrentProduct(null); // Đặt lại sản phẩm hiện tại
    setUpdatedProduct({
        flowerName: '',
        price: '',
        quantity: '',
        condition: '',
        status: '',
        category: '',
        imageUrl: null, // Đảm bảo giá trị là null cho hình ảnh
    });
};

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Gọi fetchCategories
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-24">
        <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm của bạn</h1>
         {/* Nút quay về xem shop */}
         <button
          onClick={() => navigate(`/personal-product/${userId}`)} // Điều hướng tới trang shop
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Quay về xem shop
        </button>

        {/* Nút tạo sản phẩm mới */}
        <button 
        onClick={() => navigate(`/manage-product`)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4">
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
       
      </div>
      

      {/* Modal Chỉnh sửa sản phẩm */}
      <Modal
        title="Chỉnh sửa thông tin hoa"
        visible={isModalVisible}
        onOk={async () => {
          // Gọi hàm updateProduct với productId và updatedProduct
          if (currentProduct) {
              await updateProduct(currentProduct.flowerId, updatedProduct); // Truyền đúng tham số
          }
          handleCloseEditModal(); // Đóng modal sau khi cập nhật
      }}
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
          placeholder="Condition" // Nhập điều kiện
          value={updatedProduct.condition}
          onChange={(e) => setUpdatedProduct({ ...updatedProduct, condition: e.target.value })}
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
      </Modal>

      <Footer />
    </>
  );
};

export default ManageProducts;
