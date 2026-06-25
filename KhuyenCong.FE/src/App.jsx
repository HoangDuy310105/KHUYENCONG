import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout/AdminLayout';
import PublicLayout from './components/Layout/PublicLayout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

// Import các trang Public
import HomePage from './pages/Public/HomePage';
import NewsPage from './pages/Public/NewsPage';
import GuidePage from './pages/Public/GuidePage';
import TraCuuPage from './pages/Public/TraCuuPage';

// Import các trang Master Data
import LinhVucPage from './pages/LinhVuc/LinhVucPage';
import DonViPage from './pages/DonVi/DonViPage';
import DeAnListPage from './pages/DeAn/DeAnListPage';
import DeAnFormPage from './pages/DeAn/DeAnFormPage';
import GiaiNganPage from './pages/GiaiNgan/GiaiNganPage';
import OcopPage from './pages/Ocop/OcopPage';
import BanDoPage from './pages/BanDo/BanDoPage';
import ProfilePage from './pages/Profile/ProfilePage';
import VanBanPage from './pages/VanBan/VanBanPage';
import TinTucAdminPage from './pages/TinTuc/TinTucAdminPage';
import KpiPage from './pages/Kpi/KpiPage';
import NguoiDungPage from './pages/NguoiDung/NguoiDungPage';
import QuyetToanPage from './pages/QuyetToan/QuyetToanPage';
import NhatKyHeThongPage from './pages/NhatKy/NhatKyHeThongPage';

/* Bộ bảo vệ Route: Nếu chưa có Token thì tự động chuyển về trang đăng nhập */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

/* Bộ bảo vệ Route theo phân quyền (Role) */
function RoleRoute({ children, allowedRoles }) {
  const currentRole = localStorage.getItem('role') || '4'; // Fallback admin
  if (!allowedRoles.includes(currentRole)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626', fontSize: '24px', fontWeight: 'bold' }}>403 - Forbidden</h2>
        <p style={{ marginTop: '10px' }}>Bạn không có quyền truy cập vào chức năng này.</p>
      </div>
    );
  }
  return children;
}

/* Trang placeholder khi chức năng chưa hoàn thiện */
const ComingSoon = ({ icon, label }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '60vh', gap: '16px', color: 'var(--text-secondary)'
  }}>
    <div style={{ fontSize: '64px' }}>{icon}</div>
    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)' }}>{label}</h2>
    <p style={{ fontSize: '14px' }}>Tính năng này đang được phát triển và sẽ ra mắt sớm.</p>
  </div>
);

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fee2e2', height: '100vh' }}>
          <h2>Đã xảy ra lỗi giao diện (Crash):</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import { DialogProvider } from './context/DialogContext';

function App() {
  return (
    <ErrorBoundary>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
          {/* ============================================
              VÙNG CÔNG KHAI (PUBLIC) — Dùng PublicLayout
              Người dùng chưa đăng nhập có thể xem
              ============================================ */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tra-cuu" element={<TraCuuPage />} />
            <Route path="tin-tuc" element={<NewsPage />} />
            <Route path="huong-dan" element={<GuidePage />} />
            <Route path="de-an-cong-khai" element={<ComingSoon icon="📋" label="Đề án công khai" />} />
            <Route path="lien-he" element={<ComingSoon icon="📞" label="Liên hệ hỗ trợ" />} />
          </Route>

          {/* Trang đăng nhập độc lập (Không dùng Layout chung) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ============================================
              VÙNG NGHIỆP VỤ (PRIVATE) — Dùng AdminLayout
              Cần đăng nhập, menu hiển thị theo Role
              ============================================ */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Trang tổng quan — Hiển thị khác nhau theo Role */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Trang nghiệp vụ — Sẽ hoàn thiện từng bước */}
            <Route path="de-an" element={<DeAnListPage />} />
            <Route path="de-an/tao-moi" element={<DeAnFormPage />} />
            <Route path="de-an/sua/:id" element={<DeAnFormPage />} />
            <Route path="giai-ngan" element={<GiaiNganPage />} />
            <Route path="bao-cao" element={<ComingSoon icon="📈" label="Báo cáo & KPI" />} />
            <Route path="quyet-toan" element={<RoleRoute allowedRoles={['3', '4']}><QuyetToanPage /></RoleRoute>} />
            <Route path="kpi" element={<RoleRoute allowedRoles={['3', '4']}><KpiPage /></RoleRoute>} />
            {/* Bản đồ GIS */}
            <Route path="ban-do" element={<RoleRoute allowedRoles={['3', '4']}><BanDoPage /></RoleRoute>} />

            {/* Danh mục */}
            <Route path="don-vi" element={<RoleRoute allowedRoles={['2', '3', '4', '5']}><DonViPage /></RoleRoute>} />
            <Route path="linh-vuc" element={<RoleRoute allowedRoles={['3', '4']}><LinhVucPage /></RoleRoute>} />
            <Route path="loai-de-an" element={<ComingSoon icon="🗂️" label="Loại Đề án" />} />
            <Route path="ocop" element={<OcopPage />} />
            <Route path="van-ban" element={<RoleRoute allowedRoles={['3', '4', '5']}><VanBanPage /></RoleRoute>} />
            <Route path="quan-ly-tin-tuc" element={<RoleRoute allowedRoles={['3', '4']}><TinTucAdminPage /></RoleRoute>} />

            {/* Hệ thống */}
            <Route path="nguoi-dung" element={<RoleRoute allowedRoles={['3', '4']}><NguoiDungPage /></RoleRoute>} />
            <Route path="nhat-ky" element={<RoleRoute allowedRoles={['3', '4']}><NhatKyHeThongPage /></RoleRoute>} />
            <Route path="tai-khoan" element={<Navigate to="/profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </DialogProvider>
    </ErrorBoundary>
  );
}

export default App;
