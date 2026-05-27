import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Building2, FileText, MapPin, ShieldCheck, Briefcase } from 'lucide-react';
import api from '../../services/api';
import '../Login/Login.css'; // Tái sử dụng CSS giao diện động và Glassmorphism sang trọng của login

function RegisterPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    tenDonVi: '',
    maSoThue: '',
    diaChi: '',
    loaiDonVi: '1' // 1: Thụ hưởng, 2: Thi công
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useVideoBg, setUseVideoBg] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Hiệu ứng nền 3D Canvas Particles
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

    const particleCount = Math.min(70, Math.floor((width * height) / 20000));
    const particles = [];
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
        this.z = Math.random() * 1.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        const colors = [
          'rgba(43, 86, 168, 0.45)',
          'rgba(212, 150, 10, 0.55)',
          'rgba(224, 123, 10, 0.45)',
          'rgba(255, 255, 255, 0.3)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx * this.z;
        this.y += this.vy * this.z;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
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

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

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
    const { username, password, confirmPassword, tenDonVi, maSoThue } = form;

    if (!username || !password || !confirmPassword || !tenDonVi || !maSoThue) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải dài tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        tenDonVi,
        maSoThue,
        diaChi: form.diaChi,
        loaiDonVi: parseInt(form.loaiDonVi)
      });

      if (res.data.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="login-page">
        <canvas ref={canvasRef} className="login-3d-canvas" />

        {useVideoBg && (
          <video className="login-bg-video" autoPlay loop muted playsInline poster="https://i.pinimg.com/736x/08/f1/3c/08f13c008eda9fd26bb08fa3e7ba58bc.jpg">
            <source src="https://ak.picdn.net/shutterstock/videos/3795116773/preview/preview.mp4" type="video/mp4" />
          </video>
        )}

        <div className="login-wrapper" style={{ maxWidth: '540px', padding: '10px' }}>
          {/* Khối thương hiệu */}
          <div className="system-logo" style={{ marginBottom: '0px' }}>
            <div className="logo-emblem" style={{ width: '60px', height: '60px' }}>
              <img src="https://hoangduy310105.github.io/demokhuyencong/images/logo-final.png" alt="Logo Khuyến Công" className="logo-img" />
            </div>
            <div className="logo-text-block">
              <span className="logo-ministry" style={{ fontSize: '11px' }}>BỘ CÔNG THƯƠNG</span>
              <h2 className="logo-system-name" style={{ fontSize: '14px', marginTop: '2px' }}>HỆ THỐNG QUẢN LÝ KHUYẾN CÔNG</h2>
            </div>
          </div>

          <div className="login-card" style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>Đăng ký thành công!</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              Tài khoản của bạn đã được đăng ký thành công trên hệ thống.
              <br />
              Ban quản trị sẽ xem xét phê duyệt và kích hoạt tài khoản của bạn trong vòng <strong>24 giờ</strong> tới.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '12px 36px', boxSizing: 'border-box' }}>
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <canvas ref={canvasRef} className="login-3d-canvas" />

      {useVideoBg && (
        <video className="login-bg-video" autoPlay loop muted playsInline poster="https://i.pinimg.com/736x/08/f1/3c/08f13c008eda9fd26bb08fa3e7ba58bc.jpg">
          <source src="https://ak.picdn.net/shutterstock/videos/3795116773/preview/preview.mp4" type="video/mp4" />
        </video>
      )}

      <button type="button" className="bg-toggle-btn" onClick={() => setUseVideoBg(!useVideoBg)}>
        {useVideoBg ? '🌌 Dùng Nền 3D Canvas' : '🎥 Dùng Nền Video'}
      </button>

      <div className="login-wrapper" style={{ maxWidth: '540px', padding: '10px' }}>
        {/* Khối thương hiệu */}
        <div className="system-logo" style={{ marginBottom: '0px' }}>
          <div className="logo-emblem" style={{ width: '60px', height: '60px' }}>
            <img src="https://hoangduy310105.github.io/demokhuyencong/images/logo-final.png" alt="Logo Khuyến Công" className="logo-img" />
          </div>
          <div className="logo-text-block">
            <span className="logo-ministry" style={{ fontSize: '11px' }}>BỘ CÔNG THƯƠNG</span>
            <h2 className="logo-system-name" style={{ fontSize: '14px', marginTop: '2px' }}>HỆ THỐNG QUẢN LÝ KHUYẾN CÔNG</h2>
          </div>
        </div>

        {/* Card Đăng ký Glassmorphism */}
        <div className="login-card" style={{ padding: '24px 28px' }}>
          <div className="login-header" style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '20px' }}>Đăng ký tài khoản Đơn vị</h1>
            <p className="login-subtitle" style={{ fontSize: '12px', marginTop: '4px' }}>
              Dành cho cơ sở CNNT, doanh nghiệp thi công, thụ hưởng đề án
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* THÔNG TIN TÀI KHOẢN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Tên đăng nhập (*)</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    className="form-input"
                    type="text"
                    name="username"
                    placeholder="Nhập tên tài khoản..."
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Loại đơn vị (*)</label>
                <div className="input-with-icon">
                  <Briefcase size={16} className="input-icon" />
                  <select
                    name="loaiDonVi"
                    className="form-input"
                    value={form.loaiDonVi}
                    onChange={handleChange}
                    style={{ appearance: 'none', paddingLeft: '42px', cursor: 'pointer' }}
                    required
                  >
                    <option value="1">Đơn vị thụ hưởng</option>
                    <option value="2">Đơn vị thi công</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Mật khẩu (*)</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Tối thiểu 6 ký tự..."
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu (*)</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    className="form-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu..."
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* THÔNG TIN DOANH NGHIỆP */}
            <div className="form-group">
              <label>Tên đơn vị / doanh nghiệp (*)</label>
              <div className="input-with-icon">
                <Building2 size={16} className="input-icon" />
                <input
                  className="form-input"
                  type="text"
                  name="tenDonVi"
                  placeholder="Nhập tên đầy đủ doanh nghiệp..."
                  value={form.tenDonVi}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
              <div className="form-group">
                <label>Mã số thuế (*)</label>
                <div className="input-with-icon">
                  <FileText size={16} className="input-icon" />
                  <input
                    className="form-input"
                    type="text"
                    name="maSoThue"
                    placeholder="Mã số doanh nghiệp..."
                    value={form.maSoThue}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ trụ sở</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input
                    className="form-input"
                    type="text"
                    name="diaChi"
                    placeholder="Số nhà, đường, tỉnh..."
                    value={form.diaChi}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="message error-message" style={{ margin: '8px 0 16px 0', padding: '8px 12px' }}>
                <ShieldCheck size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ margin: '8px 0 12px 0', padding: '11px' }}>
              {loading ? <span className="spinner-loader">Đang xử lý...</span> : 'Đăng ký tài khoản'}
            </button>

            <div className="login-register-link" style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)' }}>
              Đã có tài khoản?{' '}
              <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ffffff'} onMouseOut={(e) => e.target.style.color = 'var(--gold)'}>
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
