const API_BASE_URL = 'https://localhost:7288';

export function getFullImageUrl(imageUrl) {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

export const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    console.error('Chỉ chấp nhận file ảnh');
    return false;
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    console.error('Ảnh phải nhỏ hơn 2MB');
    return false;
  }
  
  return true;
};
