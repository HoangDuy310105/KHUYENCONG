import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css';

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setForm({ username: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Đăng nhập
        const res = await api.post('/auth/login', form);
        if (res.data.success) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('role', res.data.role);
          navigate('/dashboard');
        }
      } else {
        // Đăng ký - tự động cấp quyền mặc định là 1 (Người dùng thường)
        await api.post('/nguoidung', {
          username: form.username,
          password: form.password,
          role: 1, 
          isActive: true
        });
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true); // Trở lại form đăng nhập
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Nền động (Animated Background Shapes) */}
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏭</div>
          <h1>{isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</h1>
          <p>Hệ thống Quản lý Khuyến Công</p>
        </div>

        {/* Chuyển đổi giữa 2 chế độ (Tabs) */}
        <div className="tabs">
          <button type="button" className={'tab-btn ' + (isLogin ? 'active' : '')} onClick={handleToggle}>Đăng Nhập</button>
          <button type="button" className={'tab-btn ' + (!isLogin ? 'active' : '')} onClick={handleToggle}>Đăng Ký</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              className="form-input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập..."
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu..."
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Nhập lại mật khẩu</label>
              <input
                className="form-input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu..."
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="message error-message">{error}</div>}
          {success && <div className="message success-message">{success}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập Ngay' : 'Đăng Ký Tài Khoản')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
