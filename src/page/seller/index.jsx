import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import { useNavigate } from 'react-router-dom';
import Header from '../../component/header';
import Footer from '../../component/footer';

const CreateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState();
  const navigate = useNavigate();
  const [flower, setFlower] = useState({
    FlowerName: '',
    Price: 0,
    Quantity: 0,
    CategoryId: '',
    Condition: '', 
  });
  const [userId, setUserId] = useState(null);

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
        setUserId(response.data.userId); // Lưu userId vào state
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCategories();
    fetchCurrentUser(); // Gọi hàm fetchCurrentUser để lấy thông tin người dùng
    return () => {
      imageFile && URL.revokeObjectURL(imageFile.preview);
    };
  }, [imageFile]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    file.preview = URL.createObjectURL(file);
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flower.FlowerName || flower.Price <= 0 || flower.Quantity <= 0 || !flower.CategoryId) {
      alert('Vui lòng điền đầy đủ thông tin và giá trị hợp lệ.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('FlowerName', flower.FlowerName);
      formData.append('Price', flower.Price.toString());
      formData.append('Quantity', flower.Quantity.toString());
      formData.append('Condition', flower.Condition);
      formData.append('CategoryId', flower.CategoryId.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('Flowers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const newFlower = response.data;
      console.log("Sản phẩm mới:", newFlower);

      // Tạo thông báo mới
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
        console.log("Thông báo đã được tạo thành công");
      } catch (notificationError) {
        console.error("Lỗi khi tạo thông báo:", notificationError.message);
      }

      
      alert('Sản phẩm đã được tạo thành công!');
      navigate(`/manage-products/${userId}`); // Sử dụng userId đã lưu để điều hướng
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        alert(`Lỗi: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        alert('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        alert('Có lỗi xảy ra khi tạo sản phẩm: ' + error.message);
      }
    }
  };

  return (
    <>
      <Header />
      <div style={{ border: '1px solid red', padding: '20px', margin: '20px' }}>
        <div className="max-w-md mx-auto mt-10">
          <h2 className="text-2xl font-bold mb-5">Tạo Sản Phẩm Mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Tên Hoa:</label>
              <input
                type="text"
                name="FlowerName"
                value={flower.FlowerName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Giá:</label>
              <input
                type="number"
                name="Price"
                value={flower.Price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-1">Số lượng:</label>
              <input
                type="number"
                name="Quantity"
                value={flower.Quantity}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                min="1"
              />
            </div>
            <div>
            <label className="block mb-1">Condition:</label>
              <select
              name="Condition"
              value={flower.Condition}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Chọn điều kiện</option>
              <option value="100">100%</option>
              <option value="80">80%</option>
              <option value="60">60%</option>
            </select>
          </div>
            <div>
              <label className="block mb-1">Danh mục:</label>
              {loading ? (
                <p>Đang tải danh mục...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <select
                  name="CategoryId"
                  value={flower.CategoryId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block mb-1">Hình ảnh:</label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {imageFile && (
              <div>
                <img src={imageFile.preview} alt={flower.FlowerName} className="w-full mt-2" />
              </div>
            )}
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Tạo Sản Phẩm
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateProduct;