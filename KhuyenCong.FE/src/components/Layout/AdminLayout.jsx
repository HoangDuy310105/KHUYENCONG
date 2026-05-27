import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminLayout.css';

/* ================================================================
   CẤU HÌNH MENU THEO VAI TRÒ (ROLE-BASED NAVIGATION)
   Mỗi Role chỉ thấy các menu phù hợp với quyền của mình
   ================================================================ */
const NAV_BY_ROLE = {
  // Role 1: Cơ sở CNNT — Doanh nghiệp, Hợp tác xã
  '1': [
    { section: 'Cổng thông tin', items: [{ label: 'Bảng điều khiển', icon: 'fa-chart-pie', path: '/dashboard' }] },
    {
      section: 'Nghiệp vụ Đề án', items: [
        { label: 'Đề án của tôi', icon: 'fa-list-check', path: '/de-an' },
      ]
    },
    {
      section: 'Giải ngân & Báo cáo', items: [
        { label: 'Tiến độ & Giải ngân', icon: 'fa-vault', path: '/giai-ngan' },
      ]
    },
    {
      section: 'Xúc tiến thương mại', items: [
        { label: 'Sản phẩm OCOP & CNNT', icon: 'fa-award', path: '/ocop' },
      ]
    },
  ],
  // Role 2: Sở Công Thương
  '2': [
    { section: 'Hệ thống chính', items: [{ label: 'Dashboard Tỉnh/TP', icon: 'fa-chart-pie', path: '/dashboard' }] },
    {
      section: 'Nghiệp vụ Đề án', items: [
        { label: 'Thẩm định & Giám sát', icon: 'fa-list-check', path: '/de-an' },
      ]
    },
    {
      section: 'Tài chính', items: [
        { label: 'Duyệt Giải ngân', icon: 'fa-vault', path: '/giai-ngan' },
      ]
    },
    {
      section: 'Cơ sở dữ liệu', items: [
        { label: 'Doanh nghiệp địa bàn', icon: 'fa-shop', path: '/don-vi' },
        { label: 'Sản phẩm OCOP', icon: 'fa-award', path: '/ocop' },
      ]
    },
    {
      section: 'Báo cáo', items: [
        { label: 'Báo cáo TT34', icon: 'fa-chart-line', path: '/bao-cao' },
      ]
    },
  ],
  // Role 3: Bộ Công Thương
  '3': [
    {
      section: 'Hệ thống chính', items: [
        { label: 'Dashboard', icon: 'fa-chart-pie', path: '/dashboard' },
        { label: 'Bản đồ GIS', icon: 'fa-map-location-dot', path: '/ban-do' }
      ]
    },
    {
      section: 'Quản lý Đề án', items: [
        { label: 'Phê duyệt cấp Bộ', icon: 'fa-stamp', path: '/de-an' },
        { label: 'Thanh lý Quyết toán', icon: 'fa-file-invoice-dollar', path: '/quyet-toan' },
        { label: 'Giải ngân Kinh phí', icon: 'fa-vault', path: '/giai-ngan' },
      ]
    },
    {
      section: 'Cơ sở dữ liệu', items: [
        { label: 'Doanh nghiệp', icon: 'fa-shop', path: '/don-vi' },
        { label: 'Sản phẩm OCOP', icon: 'fa-award', path: '/ocop' },
        { label: 'Văn bản & Hội nghị', icon: 'fa-book-bookmark', path: '/van-ban' }
      ]
    },
    {
      section: 'Phân tích & Báo cáo', items: [
        { label: 'Chỉ tiêu KPI', icon: 'fa-chart-line', path: '/kpi' },
        { label: 'Báo cáo TT 34', icon: 'fa-file-contract', path: '/bao-cao' },
      ]
    },
  ],
  // Role 4: Admin
  '4': [
    {
      section: 'Hệ thống chính', items: [
        { label: 'Tổng quan Hệ thống', icon: 'fa-chart-pie', path: '/dashboard' },
        { label: 'Bản đồ GIS', icon: 'fa-map-location-dot', path: '/ban-do' }
      ]
    },
    {
      section: 'Nghiệp vụ', items: [
        { label: 'Toàn bộ Đề án', icon: 'fa-list-check', path: '/de-an' },
        { label: 'Kinh phí & Quyết toán', icon: 'fa-vault', path: '/giai-ngan' },
      ]
    },
    {
      section: 'Cơ sở dữ liệu', items: [
        { label: 'Doanh nghiệp', icon: 'fa-shop', path: '/don-vi' },
        { label: 'Sản phẩm OCOP', icon: 'fa-award', path: '/ocop' },
        { label: 'Văn bản & Hội nghị', icon: 'fa-book-bookmark', path: '/van-ban' }
      ]
    },
    {
      section: 'Phân tích & Báo cáo', items: [
        { label: 'Chỉ tiêu KPI', icon: 'fa-chart-line', path: '/kpi' },
        { label: 'Báo cáo TT 34', icon: 'fa-file-contract', path: '/bao-cao' },
      ]
    },
    {
      section: 'Cấu hình System', items: [
        { label: 'Quản lý Người dùng', icon: 'fa-users', path: '/nguoi-dung' },
        { label: 'Lĩnh vực & Loại ĐA', icon: 'fa-layer-group', path: '/linh-vuc' },
      ]
    },
  ],
  // Role 5: TT Khuyến công
  '5': [
    { section: 'Hệ thống chính', items: [{ label: 'Dashboard', icon: 'fa-chart-pie', path: '/dashboard' }] },
    {
      section: 'Quản lý Đề án', items: [
        { label: 'Quản lý Đề án', icon: 'fa-list-check', path: '/de-an' },
      ]
    },
    {
      section: 'Tài chính', items: [
        { label: 'Giải ngân Kinh phí', icon: 'fa-vault', path: '/giai-ngan' },
      ]
    },
    {
      section: 'Cơ sở dữ liệu', items: [
        { label: 'Doanh nghiệp', icon: 'fa-shop', path: '/don-vi' },
        { label: 'Sản phẩm OCOP', icon: 'fa-award', path: '/ocop' },
      ]
    },
  ],
};

const ROLE_INFO = {
  '1': { name: 'Cơ sở CNNT', tag: 'CNNT', color: '#16a34a', bg: 'linear-gradient(135deg,#22c55e,#15803d)', icon: 'fa-shop' },
  '2': { name: 'Sở Công Thương', tag: 'SO', color: '#d97706', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: 'fa-landmark' },
  '3': { name: 'Bộ / Cục CT', tag: 'BO', color: '#dc2626', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: 'fa-flag' },
  '4': { name: 'Quản trị viên', tag: 'ADMIN', color: '#7c3aed', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: 'fa-shield-halved' },
  '5': { name: 'TT Khuyến công', tag: 'TTKC', color: '#0891b2', bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', icon: 'fa-building-columns' },
};



/* ================================================================
   XUẤT GIAO DIỆN THEO KIỂU PROTOTYPE
   ================================================================ */
function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailedUnit, setDetailedUnit] = useState(null);

  const username = localStorage.getItem('username') || 'Admin';
  // Fallback tạm thời thành Role Admin (4) nếu chưa đăng nhập 
  const roleKey = localStorage.getItem('role') || '4';
  const roleInfo = ROLE_INFO[roleKey] || ROLE_INFO['4'];
  const navItems = NAV_BY_ROLE[roleKey] || NAV_BY_ROLE['4'];

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get('/nguoi-dung');
      // Lấy danh sách tài khoản thuộc vai trò CoSo (Role = 1) và chưa kích hoạt (IsActive = false)
      const pending = res.data.filter(u => u.role === 1 && !u.isActive);
      setPendingUsers(pending);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng chờ duyệt", err);
    }
  };

  useEffect(() => {
    if (roleKey === '4') {
      fetchPendingUsers();
      const interval = setInterval(fetchPendingUsers, 20000);
      return () => clearInterval(interval);
    }
  }, [roleKey]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/nguoi-dung/${id}/approve`);
      fetchPendingUsers();
      alert("Đã duyệt kích hoạt tài khoản thành công!");
    } catch (err) {
      alert("Lỗi phê duyệt tài khoản: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối và xóa yêu cầu tài khoản này?")) {
      try {
        await api.post(`/nguoi-dung/${id}/reject`);
        fetchPendingUsers();
        alert("Đã từ chối và xóa tài khoản thành công!");
      } catch (err) {
        alert("Lỗi từ chối tài khoản: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setDetailedUnit(null);
    if (user.donViId) {
      try {
        const res = await api.get(`/donvi/${user.donViId}`);
        setDetailedUnit(res.data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết đơn vị", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`app-shell flex h-screen overflow-hidden ${collapsed ? 'sidebar-collapsed' : ''} ${roleKey === '1' ? 'theme-coso' : ''}`}>

      {/* ==================== SIDEBAR ==================== */}
      {/* ==================== SIDEBAR ==================== */}
      {/* ==================== SIDEBAR ==================== */}
      <aside className="sidebar-container">
        {/* LOGO AREA (Fixed top) */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/logo-final.png" alt="Logo" />
          </div>
          <div>
            <div className="sidebar-title-small">Cổng Thông Tin</div>
            <div className="sidebar-title-large">Khuyến Công</div>
          </div>
        </div>

        {/* MENU AREA (Scrollable) */}
        <div className="sidebar-menu-area custom-scrollbar">
          <nav>
            {navItems.map(section => (
              <div key={section.section} className="menu-section">
                <div className="menu-items">
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <i className={`fa-solid ${item.icon} nav-icon`}></i>
                      <span>{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* ACCOUNT AREA (Fixed bottom) */}
        <div className="sidebar-footer">
          <div className="menu-items">
            <button onClick={() => navigate('/profile')} className="sidebar-nav-item btn-action-sidebar">
              <i className="fa-solid fa-gear nav-icon"></i>
              <span>Cài đặt hồ sơ</span>
            </button>
            <button onClick={handleLogout} className="sidebar-nav-item btn-action-sidebar">
              <i className="fa-solid fa-arrow-right-from-bracket nav-icon"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN AREA ==================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden content-area">
        {/* Topbar */}
        <header className="gov-banner shrink-0">
          <div className="flex justify-between px-6 py-3" style={{ alignItems: 'center' }}>
            <div className="flex gap-4" style={{ alignItems: 'center' }}>
              <div className="gov-banner-logo-wrapper">
                <img src="/images/logo-final.png" alt="Logo" />
              </div>
              <div>
                <div className="gov-banner-subtitle">Bộ Công Thương — Cục Công nghiệp địa phương</div>
                <div className="gov-banner-title">HỆ THỐNG QUẢN LÝ KHUYẾN CÔNG</div>
              </div>
            </div>

            <div className="flex gap-5" style={{ alignItems: 'center' }}>
              <div className="header-search">
                <i className="fa-solid fa-search" style={{ color: '#94a3b8' }}></i>
                <input type="text" placeholder="Tìm kiếm toàn hệ thống..." />
              </div>
              <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }}></div>
              <div className="notif-wrapper">
                <button className="text-slate-400 hover:text-indigo-600 transition-colors relative" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                  <i className="fa-solid fa-bell text-lg"></i>
                  {pendingUsers.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" style={{ border: '2px solid #ffffff' }}></span>}
                </button>
                {showNotifDropdown && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span>Yêu cầu phê duyệt tài khoản</span>
                      <span className="notif-badge-count">{pendingUsers.length}</span>
                    </div>
                    <div className="notif-list custom-scrollbar">
                      {pendingUsers.length === 0 ? (
                        <div className="notif-empty">
                          <i className="fa-solid fa-check-circle" style={{fontSize:'24px', opacity: 0.5}}></i>
                          Không có yêu cầu nào.
                        </div>
                      ) : (
                        pendingUsers.map(user => (
                          <div key={user.id} className="notif-item">
                            <div className="notif-user-info">
                              <div className="notif-username">{user.username}</div>
                              <div className="notif-company">{user.tenDonVi || 'Đang tải...'}</div>
                            </div>
                            <div className="notif-actions">
                              <button onClick={() => handleApprove(user.id)} className="btn-notif btn-notif-approve flex-1 justify-center">Duyệt</button>
                              <button onClick={() => handleViewDetails(user)} className="btn-notif btn-notif-view flex-1 justify-center">Chi tiết</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div 
                className="flex items-center gap-2 pl-4 cursor-pointer hover:opacity-80 transition-opacity" 
                style={{ borderLeft: '1px solid #e2e8f0' }}
                onClick={() => navigate('/profile')}
                title="Xem hồ sơ cá nhân"
              >
                <div className="text-right">
                  <div className="text-sm font-black text-slate-800">{roleInfo.tag}</div>
                  <div className="text-[10px] font-bold text-slate-500">{roleInfo.name}</div>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: roleInfo.bg, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <i className={`fa-solid ${roleInfo.icon}`}></i>
                </div>
              </div>
            </div>
          </div>
          {/* Breadcrumb section matches prototype */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-2 flex items-center text-xs">
            <i className="fa-solid fa-home text-slate-400 mr-2"></i>
            <span className="text-slate-500 font-medium">Hệ thống chính</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-indigo-600 font-bold">Tổng quan hệ thống</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Modal chi tiết tài khoản chờ duyệt */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết tài khoản đăng ký mới</h3>
              <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Tên đăng nhập</span>
                <span className="detail-value">{selectedUser.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tên đơn vị / doanh nghiệp</span>
                <span className="detail-value">{selectedUser.tenDonVi || 'N/A'}</span>
              </div>
              {detailedUnit && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Mã số thuế</span>
                    <span className="detail-value">{detailedUnit.maSoThue || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Địa chỉ trụ sở</span>
                    <span className="detail-value">{detailedUnit.diaChi || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Loại đơn vị</span>
                    <span className="detail-value">
                      {detailedUnit.loaiDonVi === 1 ? 'Đơn vị thụ hưởng' : 'Đơn vị thi công'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Quy mô doanh nghiệp</span>
                    <span className="detail-value">{detailedUnit.quyMo || 'N/A'}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn-notif btn-notif-reject"
                  style={{ padding: '8px 16px' }}
                  onClick={() => {
                    handleReject(selectedUser.id);
                    setSelectedUser(null);
                  }}
                >
                  Từ chối
                </button>
                <button
                  className="btn-notif btn-notif-approve"
                  style={{ padding: '8px 16px' }}
                  onClick={() => {
                    handleApprove(selectedUser.id);
                    setSelectedUser(null);
                  }}
                >
                  Phê duyệt kích hoạt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
