import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

// Bảo vệ các Route yêu cầu đăng nhập - Nếu chưa có Token thì tự chuyển về trang đăng nhập
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// Cấu hình điều hướng (Routing) cho toàn bộ ứng dụng
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chuyển hướng mặc định từ "/" về trang đăng nhập */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Trang đăng nhập - Không cần xác thực */}
        <Route path="/login" element={<LoginPage />} />

        {/* Các trang yêu cầu đăng nhập - Bao bọc bởi PrivateRoute và AppLayout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Các trang khác sẽ được bổ sung trong các giai đoạn tiếp theo */}
          <Route path="de-an" element={<div style={{color: 'var(--text-secondary)', padding: '20px'}}>📋 Trang Quản lý Đề án - Sắp ra mắt</div>} />
          <Route path="giai-ngan" element={<div style={{color: 'var(--text-secondary)', padding: '20px'}}>💰 Trang Giải ngân - Sắp ra mắt</div>} />
          <Route path="bao-cao" element={<div style={{color: 'var(--text-secondary)', padding: '20px'}}>📈 Trang Báo cáo KPI - Sắp ra mắt</div>} />
          <Route path="don-vi" element={<div style={{color: 'var(--text-secondary)', padding: '20px'}}>🏢 Trang Đơn vị - Sắp ra mắt</div>} />
          <Route path="linh-vuc" element={<div style={{color: 'var(--text-secondary)', padding: '20px'}}>🏷️ Trang Lĩnh vực - Sắp ra mắt</div>} />
          <Route path="nguoi-dung" element={<div style={{color: 'var(--text-secondary)', padding: '20px'}}>👥 Trang Người dùng - Sắp ra mắt</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
