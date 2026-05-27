import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import './Login.css';

function LoginPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useVideoBg, setUseVideoBg] = useState(true); // Đặt mặc định dùng video nền Pinterest

  // 1. Hiệu ứng nền 3D Canvas Particles (Constellation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cấu hình hạt
    const particleCount = Math.min(70, Math.floor((width * height) / 20000));
    const particles = [];

    // Tương tác chuột
    const mouse = { x: null, y: null, radius: 180 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1.8 + 0.4; // Độ sâu giả lập 3D
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        // Bảng màu kết hợp giữa xanh navy và vàng đồng khuyến công
        const colors = [
          'rgba(43, 86, 168, 0.45)',  // Xanh dương nhạt
          'rgba(212, 150, 10, 0.55)',  // Vàng đồng
          'rgba(224, 123, 10, 0.45)',  // Cam nhấn
          'rgba(255, 255, 255, 0.3)'   // Trắng mờ
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx * this.z;
        this.y += this.vy * this.z;

        // Tràn màn hình thì quay lại bên đối diện
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Tương tác với chuột
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            // Đẩy hạt ra xa chuột nhẹ nhàng tạo chiều sâu 3D
            this.x -= (dx / dist) * force * 1.2 * this.z;
            this.y -= (dy / dist) * force * 1.2 * this.z;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.z, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Khởi tạo các hạt
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Vòng lặp vẽ và cập nhật
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Vẽ các đường nối liên kết (Constellation effect)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = ((140 - dist) / 140) * 0.18 * (particles[i].z / 2);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Màu đường nối chuyển sắc mờ vàng đồng sang trọng
            ctx.strokeStyle = `rgba(212, 150, 10, ${alpha})`;
            ctx.lineWidth = 0.6 * (particles[i].z / 2);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('role', res.data.role);
        if (res.data.donViId) {
          localStorage.setItem('donViId', res.data.donViId);
        } else {
          localStorage.removeItem('donViId');
        }
        if (res.data.tenDonVi) {
          localStorage.setItem('tenDonVi', res.data.tenDonVi);
        } else {
          localStorage.removeItem('tenDonVi');
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 1. NỀN DẠNG CANVAS 3D PARTICLES */}
      <canvas ref={canvasRef} className="login-3d-canvas" />

      {/* 2. NỀN DẠNG VIDEO (Hoạt động khi useVideoBg = true) */}
      {useVideoBg && (
        <video className="login-bg-video" autoPlay loop muted playsInline poster="https://i.pinimg.com/736x/08/f1/3c/08f13c008eda9fd26bb08fa3e7ba58bc.jpg">
          <source 
            src="https://ak.picdn.net/shutterstock/videos/3795116773/preview/preview.mp4" 
            type="video/mp4" 
          />
        </video>
      )}

      {/* Điều khiển chuyển đổi Nền nhanh phục vụ chạy thử */}
      <button 
        type="button" 
        className="bg-toggle-btn"
        onClick={() => setUseVideoBg(!useVideoBg)}
        title="Đổi chế độ nền động 3D / Video"
      >
        {useVideoBg ? '🌌 Dùng Nền 3D Canvas' : '🎥 Dùng Nền Video'}
      </button>

      <div className="login-wrapper">
        {/* Khối thương hiệu Logo Bộ Công Thương */}
        <div className="system-logo">
          <div className="logo-emblem">
            <img 
              src="https://hoangduy310105.github.io/demokhuyencong/images/logo-final.png" 
              alt="Logo Khuyến Công" 
              className="logo-img" 
            />
          </div>
          <div className="logo-text-block">
            <span className="logo-ministry">BỘ CÔNG THƯƠNG</span>
            <h2 className="logo-system-name">HỆ THỐNG QUẢN LÝ KHUYẾN CÔNG</h2>
          </div>
        </div>

        {/* Form Đăng nhập phong cách Kính mờ (Glassmorphism) */}
        <div className="login-card">
          <div className="login-header">
            <h1>Đăng nhập hệ thống</h1>
            <p className="login-subtitle">Chào mừng bạn trở lại, vui lòng điền thông tin</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Tên đăng nhập */}
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="username"
                  className="form-input"
                  type="text"
                  name="username"
                  placeholder="Nhập tên tài khoản..."
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Mật khẩu</label>
                <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Lựa chọn ghi nhớ */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="change-device-link">Thiết bị xác thực</a>
            </div>

            {/* Giả lập Captcha thiết kế tinh giản hơn */}
            <div className="recaptcha-placeholder">
              <label className="recaptcha-checkbox">
                <input type="checkbox" required />
                <span>Tôi không phải là người máy</span>
              </label>
              <div className="recaptcha-logo">
                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" />
                <span>reCAPTCHA</span>
              </div>
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <div className="message error-message">
                <ShieldCheck size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Nút đăng nhập */}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <span className="spinner-loader">Đang xử lý...</span>
              ) : 'Đăng nhập'}
            </button>
            
            {/* Đăng nhập Định danh */}
            <button type="button" className="btn-secondary">
              <span className="vneid-flag">🇻🇳</span>
              Đăng nhập qua Cổng Định danh điện tử (VNeID)
            </button>

            <div className="login-register-link" style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)' }}>
              Chưa có tài khoản đơn vị?{' '}
              <Link to="/register" style={{ color: 'var(--gold)', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ffffff'} onMouseOut={(e) => e.target.style.color = 'var(--gold)'}>
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
