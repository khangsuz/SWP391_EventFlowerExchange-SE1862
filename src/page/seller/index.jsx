import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setImageFile(e.target.files[0]);
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
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">Flower Shop</div>
            <h2 className="block mt-1 text-lg leading-tight font-medium text-black">Tạo Sản Phẩm Mới</h2>
            <p className="mt-2 text-gray-500">Điền thông tin chi tiết về sản phẩm hoa của bạn.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="FlowerName" className="block text-sm font-medium text-gray-700">Tên Hoa:</label>
                <input
                  type="text"
                  name="FlowerName"
                  id="FlowerName"
                  value={flower.FlowerName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="Price" className="block text-sm font-medium text-gray-700">Giá:</label>
                <input
                  type="number"
                  name="Price"
                  id="Price"
                  value={flower.Price}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="Quantity" className="block text-sm font-medium text-gray-700">Số lượng:</label>
                <input
                  type="number"
                  name="Quantity"
                  id="Quantity"
                  value={flower.Quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="CategoryId" className="block text-sm font-medium text-gray-700">Danh mục:</label>
                {loading ? (
                  <p className="mt-1 text-sm text-gray-500">Đang tải danh mục...</p>
                ) : error ? (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                ) : (
                  <select
                    name="CategoryId"
                    id="CategoryId"
                    value={flower.CategoryId}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Hình ảnh:</label>
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Tạo Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;