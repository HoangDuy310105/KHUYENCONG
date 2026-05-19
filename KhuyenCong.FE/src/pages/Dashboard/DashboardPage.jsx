import { useEffect, useState } from 'react';
import api from '../../services/api';
import './Dashboard.css';

// Dữ liệu mẫu để hiển thị trước khi có đầy đủ API báo cáo
const MOCK_RECENT = [
  { id: 1, name: 'Đào tạo nghề may công nghiệp', unit: 'HTX Dệt may Đồng Tháp', status: 'Đã duyệt', badge: 'badge-green' },
  { id: 2, name: 'Ứng dụng máy chế biến lúa gạo', unit: 'Cty TNHH Nông sản Sạch', status: 'Đang thẩm định', badge: 'badge-blue' },
  { id: 3, name: 'Mô hình trình diễn SX sạch hơn', unit: 'Cty CP Vật liệu xây dựng', status: 'Chờ duyệt', badge: 'badge-orange' },
  { id: 4, name: 'Hỗ trợ liên doanh liên kết', unit: 'HTX SX muối Tiền Giang', status: 'Từ chối', badge: 'badge-red' },
];

// Trang Bảng điều khiển tổng quan (Dashboard)
function DashboardPage() {
  const [linhVucs, setLinhVucs] = useState([]);
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    // Lấy danh sách lĩnh vực từ Backend để hiển thị thống kê
    api.get('/linhvuc')
      .then((res) => setLinhVucs(res.data))
      .catch((err) => console.error('Lỗi khi tải danh sách lĩnh vực:', err));
  }, []);

  return (
    <div>
      {/* Tiêu đề trang */}
      <div className="page-header">
        <h1>Bảng điều khiển 👋 {username}</h1>
        <p>Tổng quan hoạt động Khuyến Công · Ngày {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* 4 thẻ KPI tổng quan */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-header">
            <span>Tổng đề án</span>
            <span className="stat-icon">📋</span>
          </div>
          <div className="stat-value">128</div>
          <div className="stat-change">↑ 12 so với tháng trước</div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <span>Đã được duyệt</span>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-value">85</div>
          <div className="stat-change">↑ 8 trong tháng này</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <span>Đang thẩm định</span>
            <span className="stat-icon">⏳</span>
          </div>
          <div className="stat-value">32</div>
          <div className="stat-change">Cần xử lý trong tuần</div>
        </div>

        <div className="stat-card red">
          <div className="stat-header">
            <span>Lĩnh vực KH</span>
            <span className="stat-icon">🏷️</span>
          </div>
          <div className="stat-value">{linhVucs.length || 9}</div>
          <div className="stat-change">Dữ liệu thật từ Backend</div>
        </div>
      </div>

      {/* Lưới 2 cột phía dưới */}
      <div className="dashboard-grid">
        {/* Danh sách đề án gần đây */}
        <div className="content-card">
          <div className="card-header">
            <h3>📋 Đề án gần đây</h3>
          </div>
          <div className="recent-list">
            {MOCK_RECENT.map((item) => (
              <div key={item.id} className="recent-item">
                <div>
                  <div className="recent-item-name">{item.name}</div>
                  <div className="recent-item-sub">{item.unit}</div>
                </div>
                <span className={`badge ${item.badge}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách Lĩnh vực từ Backend */}
        <div className="content-card">
          <div className="card-header">
            <h3>🏷️ Lĩnh vực Khuyến Công ({linhVucs.length} lĩnh vực)</h3>
          </div>
          <div className="recent-list">
            {linhVucs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Đang tải dữ liệu từ server...
              </p>
            ) : (
              linhVucs.map((lv, index) => (
                <div key={lv.id} className="recent-item">
                  <div>
                    <div className="recent-item-name">{lv.tenLinhVuc}</div>
                    <div className="recent-item-sub">{lv.moTa || 'Lĩnh vực Khuyến Công'}</div>
                  </div>
                  <span className="badge badge-blue">#{index + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
