import { useState, useEffect } from 'react';
import { BarChart3, Save, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import './Kpi.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function KpiPage() {
  const [deAns, setDeAns] = useState([]);
  const [selectedDeAnId, setSelectedDeAnId] = useState('');
  
  // Custom Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 3000);
  };

  // State for the 12 metrics
  const defaultMetrics = {
    doanhThu: 0,
    loiNhuan: 0,
    dongGopNganSach: 0,
    sanLuongTangThem: 0,
    soSanPhamMoi: 0,
    giamPhePham: 0,
    tietKiemNguyenLieu: 0,
    soLaoDongMoi: 0,
    thuNhapBinhQuan: 0,
    tyLeLaoDongNu: 0,
    soMayMocChuyenGiao: 0,
    giamOThiemMoiTruong: 0
  };
  
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch danh sách đề án
    const fetchDeAns = async () => {
      try {
        const res = await api.get('/dean?pageSize=1000'); 
        setDeAns(res.data.items || res.data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách Đề án:', error);
      }
    };
    fetchDeAns();
  }, []);

  useEffect(() => {
    if (!selectedDeAnId) {
      setMetrics(defaultMetrics);
      return;
    }

    const fetchKpi = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ChiTieuKPI/${selectedDeAnId}`);
        if (res.data && res.data.thongKeHieuQua) {
          const parsed = typeof res.data.thongKeHieuQua === 'string' 
            ? JSON.parse(res.data.thongKeHieuQua) 
            : res.data.thongKeHieuQua;
            
          setMetrics({ ...defaultMetrics, ...parsed });
        } else {
          setMetrics(defaultMetrics);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setMetrics(defaultMetrics);
        } else {
          console.error('Lỗi khi tải KPI:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchKpi();
  }, [selectedDeAnId]);

  const handleChange = (key, value) => {
    setMetrics(prev => ({
      ...prev,
      [key]: Number(value) || 0
    }));
  };

  const handleSave = async () => {
    if (!selectedDeAnId) {
      showToast('Vui lòng chọn một Đề án!', 'error');
      return;
    }
    
    setSaving(true);
    try {
      await api.post('/ChiTieuKPI', {
        deAnId: selectedDeAnId,
        thongKeHieuQua: metrics
      });
      showToast('Lưu kết quả đánh giá KPI thành công!');
    } catch (error) {
      showToast('Lỗi khi lưu KPI: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const chartData = {
    labels: ['Hiệu quả Kinh tế', 'Năng suất & Công nghệ', 'Tác động Xã hội', 'Bảo vệ Môi trường'],
    datasets: [
      {
        label: 'Mức độ hiệu quả',
        data: [
          Math.min(100, (metrics.doanhThu / 100) * 20 + (metrics.loiNhuan / 50) * 40 + (metrics.dongGopNganSach / 10) * 40),
          Math.min(100, metrics.sanLuongTangThem + metrics.giamPhePham + metrics.tietKiemNguyenLieu + (metrics.soMayMocChuyenGiao * 10)),
          Math.min(100, (metrics.soLaoDongMoi * 5) + (metrics.thuNhapBinhQuan / 10 * 20) + metrics.tyLeLaoDongNu),
          metrics.giamOThiemMoiTruong * 10
        ],
        backgroundColor: 'rgba(139, 0, 0, 0.2)', // Primary Red transparent
        borderColor: '#8b0000',
        borderWidth: 2,
        pointBackgroundColor: '#d4a017', // Gold
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#d4a017'
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          font: { family: 'Be Vietnam Pro', size: 13, weight: 'bold' },
          color: '#2c2c2c'
        },
        ticks: { display: false, min: 0, max: 100, stepSize: 20 }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) { return `Chỉ số đánh giá: ${context.raw.toFixed(1)} Điểm`; }
        }
      }
    }
  };

  return (
    <div className="kpi-container">
      <div className="kpi-header">
        <div className="header-title">
          <BarChart3 size={24} className="title-icon" />
          <h2>Chỉ tiêu đánh giá KPI Đề án</h2>
        </div>
      </div>
      
      <div className="kpi-filter panel">
        <div className="form-group-filter">
          <label>Chọn Đề án cần đánh giá:</label>
          <select 
            value={selectedDeAnId} 
            onChange={e => setSelectedDeAnId(e.target.value)}
            className="dean-select"
            disabled={deAns.length === 0}
          >
            {deAns.length === 0 ? (
              <option value="">-- Chưa có Đề án nào trong hệ thống --</option>
            ) : (
              <option value="">-- Vui lòng chọn Đề án --</option>
            )}
            {deAns.map(da => (
              <option key={da.id} value={da.id}>
                {da.tenDeAn || 'Đề án chưa có tên'} {da.maDeAn ? `(${da.maDeAn})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedDeAnId && (
        <div className="kpi-content">
          <div className="kpi-form-section panel">
            <h3 className="section-title">Nhập liệu 12 Chỉ số Đánh giá</h3>
            
            {loading ? (
              <div className="loading-state">Đang tải dữ liệu...</div>
            ) : (
              <div className="metrics-grid">
                {/* Nhóm 1: Kinh tế */}
                <div className="metric-group">
                  <h4 className="group-title">1. Hiệu quả Kinh tế</h4>
                  <div className="form-group">
                    <label>Doanh thu tăng thêm (Triệu VNĐ/Năm)</label>
                    <input type="number" min="0" value={metrics.doanhThu} onChange={e => handleChange('doanhThu', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Lợi nhuận tăng thêm (Triệu VNĐ/Năm)</label>
                    <input type="number" min="0" value={metrics.loiNhuan} onChange={e => handleChange('loiNhuan', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Đóng góp NSNN / Thuế (Triệu VNĐ)</label>
                    <input type="number" min="0" value={metrics.dongGopNganSach} onChange={e => handleChange('dongGopNganSach', e.target.value)} />
                  </div>
                </div>

                {/* Nhóm 2: Sản xuất */}
                <div className="metric-group">
                  <h4 className="group-title">2. Năng lực Sản xuất</h4>
                  <div className="form-group">
                    <label>Sản lượng SP tăng thêm (%)</label>
                    <input type="number" min="0" max="1000" value={metrics.sanLuongTangThem} onChange={e => handleChange('sanLuongTangThem', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Tỷ lệ giảm phế phẩm (%)</label>
                    <input type="number" min="0" max="100" value={metrics.giamPhePham} onChange={e => handleChange('giamPhePham', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Tiết kiệm nguyên vật liệu (%)</label>
                    <input type="number" min="0" max="100" value={metrics.tietKiemNguyenLieu} onChange={e => handleChange('tietKiemNguyenLieu', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Sản phẩm mới (Số lượng)</label>
                    <input type="number" min="0" value={metrics.soSanPhamMoi} onChange={e => handleChange('soSanPhamMoi', e.target.value)} />
                  </div>
                </div>

                {/* Nhóm 3: Xã hội */}
                <div className="metric-group">
                  <h4 className="group-title">3. Tác động Xã hội</h4>
                  <div className="form-group">
                    <label>Số lao động mới (Người)</label>
                    <input type="number" min="0" value={metrics.soLaoDongMoi} onChange={e => handleChange('soLaoDongMoi', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Thu nhập (Triệu VNĐ/Tháng)</label>
                    <input type="number" min="0" value={metrics.thuNhapBinhQuan} onChange={e => handleChange('thuNhapBinhQuan', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Lao động nữ/khuyết tật (%)</label>
                    <input type="number" min="0" max="100" value={metrics.tyLeLaoDongNu} onChange={e => handleChange('tyLeLaoDongNu', e.target.value)} />
                  </div>
                </div>

                {/* Nhóm 4: Công nghệ */}
                <div className="metric-group">
                  <h4 className="group-title">4. Công nghệ & Môi trường</h4>
                  <div className="form-group">
                    <label>Thiết bị chuyển giao (Cái)</label>
                    <input type="number" min="0" value={metrics.soMayMocChuyenGiao} onChange={e => handleChange('soMayMocChuyenGiao', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Giảm ô nhiễm (1-10 Điểm)</label>
                    <input type="number" min="0" max="10" value={metrics.giamOThiemMoiTruong} onChange={e => handleChange('giamOThiemMoiTruong', e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button className="btn-save-kpi" onClick={handleSave} disabled={saving || loading}>
                <Save size={18} />
                {saving ? 'Đang lưu...' : 'Lưu lại đánh giá KPI'}
              </button>
            </div>
          </div>

          <div className="kpi-chart-section panel">
            <h3 className="section-title">Biểu đồ Đánh giá Tổng quan</h3>
            <div className="chart-container">
              <Radar data={chartData} options={chartOptions} />
            </div>
            <div className="chart-info">
              <p>Biểu đồ tự động phân tích và quy đổi điểm dựa trên dữ liệu nhập (Điểm tối đa 100/trục).</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`custom-toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={20} className="toast-icon" />
          ) : (
            <XCircle size={20} className="toast-icon" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default KpiPage;
