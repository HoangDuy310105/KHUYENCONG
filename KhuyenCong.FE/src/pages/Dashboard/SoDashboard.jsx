import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Activity, DollarSign, Award, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './DashboardPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

function SoDashboard() {
  const navigate = useNavigate();
  const [localDeAns, setLocalDeAns] = useState([]);
  const [localOcops, setLocalOcops] = useState([]);
  const [linhVucs, setLinhVucs] = useState([]);
  
  useEffect(() => {
    // Tạm thời lấy tất cả, nếu Backend có phân quyền theo Tỉnh thì sẽ tự động lọc
    Promise.all([
      api.get('/dean?page=1&pageSize=100'),
      api.get('/SanPhamOcop?page=1&pageSize=100'),
      api.get('/linhvuc')
    ]).then(([daRes, ocopRes, lvRes]) => {
      const allDa = daRes.data?.Items || daRes.data?.items || daRes.data?.data || (Array.isArray(daRes.data) ? daRes.data : []);
      const allOcop = ocopRes.data?.items || ocopRes.data?.data || (Array.isArray(ocopRes.data) ? ocopRes.data : []);
      
      // Lọc các đề án liên quan đến thẩm quyền Sở (hoặc toàn bộ nếu chưa có data địa bàn chuẩn)
      // Trong thực tế, cần lọc dựa vào tỉnh của Sở. Ở đây prototype tạm dùng tất cả hoặc lọc các trạng thái Sở quan tâm.
      setLocalDeAns(allDa);
      setLocalOcops(allOcop);
      setLinhVucs(lvRes.data || []);
    }).catch(err => console.error(err));
  }, []);

  const countPendingSo = localDeAns.filter(x => x.trangThai === 1).length;
  const countInProgress = localDeAns.filter(x => x.trangThai >= 5 && x.trangThai <= 6).length;
  const countNghiemThu = localDeAns.filter(x => x.trangThai === 6).length; // Chờ nghiệm thu
  const totalKinhPhi = localDeAns.reduce((sum, da) => sum + (da.kinhPhiDuKien || 0), 0);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatCompactCurrency = (val) => {
    if (!val) return '0 ₫';
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' Tỷ';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Tr';
    return formatCurrency(val);
  };

  // Chart Data
  const lvTopData = linhVucs.slice(0, 5);
  const pieChartData = {
    labels: lvTopData.map(lv => lv.tenLinhVuc?.length > 15 ? lv.tenLinhVuc.substring(0, 15) + '...' : lv.tenLinhVuc),
    datasets: [{
      data: lvTopData.map(lv => localDeAns.filter(da => da.linhVucId === lv.id).length),
      backgroundColor: ['#d97706', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="db-container">
      <div className="db-header" style={{ backgroundColor: '#fff', borderBottom: '2px solid #d97706', paddingBottom: '20px' }}>
        <div>
          <h1 className="db-title" style={{ color: '#d97706' }}>
            <Activity color="#d97706" size={28} />
            BẢNG ĐIỀU KHIỂN SỞ CÔNG THƯƠNG
          </h1>
          <p className="db-subtitle">Theo dõi, thẩm định và quản lý các hoạt động Khuyến công trên địa bàn Tỉnh/Thành phố</p>
        </div>
      </div>

      <div className="db-grid-4" style={{ marginTop: '20px' }}>
        <div className="stat-card orange">
          <div className="stat-info">
            <p className="stat-label">CHỜ SỞ THẨM ĐỊNH</p>
            <p className="stat-value">{countPendingSo}</p>
          </div>
          <div className="stat-icon orange"><FileText size={24} /></div>
        </div>

        <div className="stat-card blue">
          <div className="stat-info">
            <p className="stat-label">ĐANG TRIỂN KHAI</p>
            <p className="stat-value">{countInProgress}</p>
          </div>
          <div className="stat-icon blue"><Activity size={24} /></div>
        </div>

        <div className="stat-card green">
          <div className="stat-info">
            <p className="stat-label">CHỜ NGHIỆM THU</p>
            <p className="stat-value">{countNghiemThu}</p>
          </div>
          <div className="stat-icon green"><CheckCircle size={24} /></div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-info">
            <p className="stat-label">TỔNG KINH PHÍ ĐỀ XUẤT</p>
            <p className="stat-value">{formatCompactCurrency(totalKinhPhi)}</p>
          </div>
          <div className="stat-icon yellow"><DollarSign size={24} /></div>
        </div>
      </div>

      <div className="db-grid-2" style={{ marginTop: '24px' }}>
        <div className="db-panel">
          <h3 className="panel-title"><TrendingUp size={18} /> 1. Xu hướng Đề án & Doanh nghiệp thụ hưởng (5 năm)</h3>
          <div className="chart-container">
            <Line 
              data={{
                labels: [2022, 2023, 2024, 2025, 2026],
                datasets: [
                  { label: 'Số lượng Đề án', data: [5, 8, 12, 10, localDeAns.length], borderColor: '#d97706', backgroundColor: '#d9770622', fill: true, tension: 0.4 },
                  { label: 'Doanh nghiệp thụ hưởng', data: [7, 10, 15, 12, localDeAns.length + 5], borderColor: '#10b981', backgroundColor: '#10b98122', fill: true, tension: 0.4 }
                ]
              }} 
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} 
            />
          </div>
        </div>

        <div className="db-panel">
          <h3 className="panel-title"><BarChart3 size={18} /> 2. Kinh phí Khuyến công Thực hiện vs Dự kiến</h3>
          <div className="chart-container">
             <Line 
              data={{
                labels: [2022, 2023, 2024, 2025, 2026],
                datasets: [
                  { label: 'Kinh phí Dự kiến (Tỷ VNĐ)', data: [4.5, 6.2, 8.4, 7.1, (totalKinhPhi/1e9).toFixed(1)], borderColor: '#64748b', backgroundColor: '#64748b11', fill: true, tension: 0.4, borderDash: [5, 5] },
                  { label: 'Kinh phí Đã thực hiện (Tỷ VNĐ)', data: [3.2, 5.5, 7.1, 6.5, ((totalKinhPhi*0.6)/1e9).toFixed(1)], borderColor: '#0ea5e9', backgroundColor: '#0ea5e911', fill: true, tension: 0.4 }
                ]
              }} 
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} 
            />
          </div>
        </div>
      </div>

      <div className="db-grid-2" style={{ marginTop: '24px' }}>
        <div className="db-panel">
          <h3 className="panel-title"><TrendingUp size={18} /> 3. Tỷ lệ Hỗ trợ theo Lĩnh vực (Năm nay)</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </div>

        <div className="table-panel">
          <div className="table-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#d97706' }}>
              <Clock size={18} /> Cần Xử Lý Gấp (Chờ Thẩm Định)
            </h3>
            <button onClick={() => navigate('/de-an')} className="btn-link" style={{ color: '#d97706' }}>
              Xem tất cả &rarr;
            </button>
          </div>
          <div className="table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Mã Hồ Sơ</th>
                  <th>Tên Đề Án</th>
                  <th className="th-right">Kinh phí đề nghị</th>
                  <th className="th-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {localDeAns.filter(d => d.trangThai === 1).slice(0, 5).length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <AlertCircle size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                      Không có hồ sơ nào đang chờ Sở thẩm định.
                    </td>
                  </tr>
                ) : (
                  localDeAns.filter(d => d.trangThai === 1).slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td className="td-id">{item.maDeAn || '---'}</td>
                      <td className="td-name">{item.tenDeAn}</td>
                      <td className="td-money">{formatCurrency(item.kinhPhiDuKien)}</td>
                      <td className="th-center">
                        <span className="status-badge" style={{ backgroundColor: '#fef9ec', color: '#d97706', border: '1px solid #d97706' }}>Chờ Sở Duyệt</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoDashboard;
