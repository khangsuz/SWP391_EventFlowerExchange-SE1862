import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [flower, setFlower] = useState({
    
    FlowerName: '',
    Price: 0,
    Quantity: 0,
    CategoryId: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

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

    fetchCategories();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlower(prevFlower => ({
      ...prevFlower,
      [name]: name === 'Price' || name === 'Quantity' || name === 'CategoryId' ? parseFloat(value) : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
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
      formData.append('CategoryId', flower.CategoryId.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }
  
      console.log("FormData being sent:", Object.fromEntries(formData));
  
      const response = await api.post('Flowers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
  
      console.log("API response:", response);
      alert('Sản phẩm đã được tạo thành công!');
      navigate('/products');
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
  {imagePreview && (
    <img 
      src={imagePreview}
      alt="Preview" 
      className="mt-2 max-w-full h-auto"
      style={{ maxHeight: '200px' }}
    />
  )}
</div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Tạo Sản Phẩm
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;