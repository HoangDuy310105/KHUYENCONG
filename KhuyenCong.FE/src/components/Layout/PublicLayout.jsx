import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import './PublicLayout.css';

/* Danh sách menu điều hướng */
const NAV_LINKS = [
  { label: 'Trang chủ',      path: '/' },
  { label: 'Tra cứu',        path: '/tra-cuu' },
  { label: 'Tin tức',        path: '/tin-tuc' },
  { label: 'Hướng dẫn sử dụng', path: '/huong-dan' },
  { label: 'Đề án công khai', path: '/de-an-cong-khai' },
];

/* Component hiển thị giờ thực */
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="nav-datetime">
      <div className="time">{timeStr}</div>
      <div className="date">{dateStr}</div>
    </div>
  );
};

const PublicLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <div className="public-layout">

      {/* ========================================================
          HEADER
          Tầng 1: Utility bar (Logo hệ thống + Hotline + Links)
          Tầng 2: Nav bar (Menu + Đồng hồ + Nút Đăng nhập)
          ======================================================== */}
      <header className="public-header">

        {/* TẦNG 1 — Utility Bar (Navy đậm) */}
        <div className="header-utility">
          <div className="header-utility-inner">
            {/* Logo + Tên hệ thống */}
            <div className="utility-logo-area">
              <Link to="/" className="utility-emblem">
                <img 
                  src="https://hoangduy310105.github.io/demokhuyencong/images/logo-final.png" 
                  alt="Logo Khuyến Công" 
                  className="utility-logo-img" 
                />
                <div className="utility-title-block">
                  <span className="utility-ministry">BỘ CÔNG THƯƠNG</span>
                  <span className="utility-system-name">Hệ thống Quản lý Khuyến Công</span>
                </div>
              </Link>
            </div>

            {/* Phía phải: Hotline + Link phụ */}
            <div className="utility-right">
              <div className="utility-hotline">
                📞 Tổng đài hỗ trợ: 1900 1234
              </div>
              <div className="utility-links">
                <a href="#">Giới thiệu</a>
                <a href="#">Tin tức</a>
                <a href="#">Thông báo</a>
                <a href="#">Liên hệ · Góp ý</a>
                <a href="#">Tiếng Việt ▾</a>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 2 — Nav Bar (Trắng + viền vàng đồng phía dưới) */}
        <div className="header-nav-bar">
          <div className="header-nav-inner">
            {/* Menu điều hướng */}
            <nav className="desktop-nav">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Phía phải: Giờ + Nút hành động */}
            <div className="nav-bar-right">
              <LiveClock />
              <Link to="/login" className="btn-register">Đăng ký</Link>
              <Link to="/login" className="btn-login">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Đăng nhập
              </Link>

              {/* Hamburger cho mobile */}
              <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                <span/><span/><span/>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <nav className="mobile-nav">
            {NAV_LINKS.map(link => (
              <NavLink key={link.path} to={link.path} end={link.path === '/'} className="mobile-nav-link">
                {link.label}
              </NavLink>
            ))}
            <Link to="/login" className="mobile-nav-login">Đăng nhập Hệ thống</Link>
          </nav>
        )}
      </header>

      {/* Nội dung trang */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* ========================================================
          FOOTER
          ======================================================== */}
      <footer className="public-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-col footer-brand">
              <div className="footer-logo">
                <svg viewBox="0 0 44 44" fill="none">
                  <circle cx="22" cy="22" r="20" fill="white" fillOpacity="0.12" stroke="#d4960a" strokeWidth="1.5"/>
                  <text x="22" y="28" textAnchor="middle" fill="#d4960a" fontSize="13" fontWeight="800" fontFamily="Be Vietnam Pro">KC</text>
                </svg>
                <span>Khuyến Công Việt Nam</span>
              </div>
              <p>Hỗ trợ phát triển công nghiệp nông thôn, kết nối doanh nghiệp CNNT với chính sách nhà nước một cách minh bạch và hiệu quả.</p>
              <div className="footer-contact">
                <span>📍 Số 54 Hai Bà Trưng, Hoàn Kiếm, Hà Nội</span>
                <span>📞 1900 1234</span>
                <span>✉ khuyencong@moit.gov.vn</span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Thông tin hệ thống</h4>
              <ul>
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/tin-tuc">Tin tức & Thông báo</Link></li>
                <li><Link to="/de-an-cong-khai">Đề án công khai</Link></li>
                <li><Link to="/huong-dan">Hướng dẫn sử dụng</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Căn cứ pháp lý</h4>
              <ul>
                <li><a href="#">Nghị định 45/2012/NĐ-CP</a></li>
                <li><a href="#">Thông tư 36/2013/TT-BCT</a></li>
                <li><a href="#">Thông tư 28/2018/TT-BTC</a></li>
                <li><a href="#">Thông tư 34/2022/TT-BCT</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Liên kết</h4>
              <ul>
                <li><a href="https://moit.gov.vn" target="_blank" rel="noopener">Bộ Công Thương</a></li>
                <li><a href="https://vca.gov.vn" target="_blank" rel="noopener">Cục CN Địa Phương</a></li>
                <li><Link to="/login">Cổng nội bộ</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Cục Công Nghiệp Địa Phương — Bộ Công Thương Việt Nam</span>
            <span>Phát triển bởi <strong>Nguyễn Hoàng Duy (DuyNH)</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
