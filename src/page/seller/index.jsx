import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  console.log("CreateProduct component is rendering");

  const [flower, setFlower] = useState({
    flowerName: '',
    description: '',
    price: 0,
    quantity: 0,
    imageUrl: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("CreateProduct component mounted");
    return () => {
      console.log("CreateProduct component will unmount");
    };
  }, []);

  const handleChange = (e) => {
    setFlower({ ...flower, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log("Submitting flower data:", flower);
      console.log("Token used for request:", token);
      const response = await axios.post('api/Flowers/create', flower, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("API response:", response);
      alert('Sản phẩm đã được tạo thành công!');
      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Có lỗi xảy ra khi tạo sản phẩm.');
    }
  };

  return (
    <div style={{border: '1px solid red', padding: '20px', margin: '20px'}}>
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-5">Tạo Sản Phẩm Mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Tên Hoa:</label>
            <input
              type="text"
              name="flowerName"
              value={flower.flowerName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Mô tả:</label>
            <textarea
              name="description"
              value={flower.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Giá:</label>
            <input
              type="number"
              name="price"
              value={flower.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Số lượng:</label>
            <input
              type="number"
              name="quantity"
              value={flower.quantity}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">URL Hình ảnh:</label>
            <input
              type="text"
              name="imageUrl"
              value={flower.imageUrl}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
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