import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';

// Danh sách các mục menu của Sidebar
const NAV_ITEMS = [
  {
    section: 'Tổng quan',
    items: [
      { label: 'Bảng điều khiển', icon: '📊', path: '/dashboard' },
    ]
  },
  {
    section: 'Nghiệp vụ',
    items: [
      { label: 'Quản lý Đề án', icon: '📋', path: '/de-an' },
      { label: 'Giải ngân & Quyết toán', icon: '💰', path: '/giai-ngan' },
      { label: 'Báo cáo & KPI', icon: '📈', path: '/bao-cao' },
    ]
  },
  {
    section: 'Danh mục',
    items: [
      { label: 'Đơn vị / Doanh nghiệp', icon: '🏢', path: '/don-vi' },
      { label: 'Lĩnh vực', icon: '🏷️', path: '/linh-vuc' },
      { label: 'Người dùng', icon: '👥', path: '/nguoi-dung' },
    ]
  },
];

// Component Layout chung - Bộ khung bao quanh toàn bộ ứng dụng
function AppLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  // Lấy thông tin người dùng đang đăng nhập từ LocalStorage
  const username = localStorage.getItem('username') || 'Admin';
  const roleMap = { '0': 'CNNT', '1': 'TTKC', '2': 'SO', '3': 'BO', '4': 'ADMIN' };
  const roleStr = roleMap[localStorage.getItem('role')] || 'ADMIN';

  // Xử lý đăng xuất: Xóa token và chuyển về trang đăng nhập
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* ========== SIDEBAR BÊN TRÁI ========== */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo thương hiệu */}
        <div className="sidebar-brand">
          <div className="brand-icon">🏭</div>
          <div className="brand-text">
            <h2>Khuyến Công</h2>
            <p>Sở Công Thương</p>
          </div>
        </div>

        {/* Các mục menu điều hướng */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Thông tin người dùng ở cuối sidebar */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">{username}</div>
                <div className="user-role">{roleStr}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========== KHU VỰC NỘI DUNG BÊN PHẢI ========== */}
      <div className="main-content">
        {/* Thanh công cụ phía trên (Topbar / Header) */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Nút thu gọn / mở rộng Sidebar */}
            <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '→' : '←'}
            </button>
            <span className="page-title">Hệ thống Quản lý Khuyến Công</span>
          </div>

          <div className="topbar-right">
            {/* Nút thông báo */}
            <button className="notif-btn">
              🔔
              <span className="notif-badge"></span>
            </button>

            {/* Nút đăng xuất */}
            <button className="logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Nội dung của từng trang sẽ được render tại đây */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
