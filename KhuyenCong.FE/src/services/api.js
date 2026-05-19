// Cấu hình Axios - Giao tiếp với Backend API
import axios from 'axios';

// Địa chỉ Backend API đang chạy cục bộ
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm Token JWT vào mọi request (Nếu có đăng nhập)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động xử lý lỗi 401 (Token hết hạn) - Bắt buộc đăng nhập lại
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
