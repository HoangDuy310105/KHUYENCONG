import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, CheckCircle, Clock, Map, 
  PieChart as PieChartIcon, DollarSign, Activity, 
  BarChart3, TrendingUp, Target,
  Wrench, ChevronDown, Eye, XCircle, X, HelpCircle, Info, FolderOpen
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  ArcElement, LineElement, PointElement, Title, Tooltip, 
  Legend, RadialLinearScale, Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './DashboardPage.css';
import '../DeAn/DeAnList.css'; // Import CSS của Quản lý đề án để tái sử dụng giao diện

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, 
  LineElement, PointElement, Title, Tooltip, Legend, 
  RadialLinearScale, Filler
);

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ef4444', '#14b8a6', '#0f172a', '#d946ef'
];

// ── TRẠNG THÁI & COMPONENT TỪ QUẢN LÝ ĐỀ ÁN ────────────────────────────────────
const STATUS_MAP = {
  0: { label: 'Bản Nháp',          color: '#64748b', bg: '#f1f5f9' },
  1: { label: 'Chờ Sở Thẩm Định',  color: '#d97706', bg: '#fef9ec' },
  2: { label: 'Chờ Cục Thẩm Định',  color: '#2563eb', bg: '#eff6ff' },
  3: { label: 'Yêu Cầu Bổ Sung',   color: '#b91c1c', bg: '#fef2f2' },
  4: { label: 'Bị Từ Chối',        color: '#dc2626', bg: '#fef2f2' },
  5: { label: 'Đã Phê Duyệt',      color: '#0369a1', bg: '#f0f9ff' },
  6: { label: 'Đang Thực Hiện',    color: '#047857', bg: '#ecfdf5' },
  7: { label: 'Đã Nghiệm Thu',     color: '#6d28d9', bg: '#f5f3ff' },
  8: { label: 'Đã Quyết Toán',     color: '#2d3a4fff', bg: '#f9fafb' },
};

const DB_TO_VISUAL = { 0: 0, 1: 1, 2: 2, 3: 1, 4: 2, 5: 3, 6: 6, 7: 8, 8: 9 };

const STEPS_11 = [
  { label: 'Đăng ký\nhồ sơ' },
  { label: 'Thẩm định\ncơ sở' },
  { label: 'Thẩm định\ncấp Bộ' },
  { label: 'Phê duyệt\nKH' },
  { label: 'Giao kế\nhoạch' },
  { label: 'Ký hợp\nđồng' },
  { label: 'Đang\nthực hiện' },
  { label: 'Kiểm tra\ngiám sát' },
  { label: 'Báo cáo\nkết quả' },
  { label: 'Thanh lý\nquyết toán' },
  { label: 'Hoàn tất\nđề án', isLast: true },
];

function WorkflowBar({ status }) {
  const active = DB_TO_VISUAL[status] ?? 0;
  const isError = status === 3 || status === 4;
  const percent = active === 10 ? 100 : Math.round((active / 10) * 100);
  const color = isError ? '#ef4444' : (STATUS_MAP[status]?.color || '#64748b');

  return (
    <div className="mini-workflow-bar" title={isError ? 'Hồ sơ cần bổ sung' : `${percent}% hoàn thành`}>
      <div className="mini-workflow-track">
        <div 
          className="mini-workflow-fill" 
          style={{ width: `${percent}%`, backgroundColor: color }} 
        />
      </div>
      <div className="mini-workflow-text" style={{ color: color }}>
        {isError ? 'Cần bổ sung' : `${percent}%`}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP[0];
  return (
    <div className="status-badge-modern" style={{ color: s.color, backgroundColor: s.bg, borderColor: `${s.color}40` }}>
      <span className="status-dot" style={{ backgroundColor: s.color }}></span>
      {s.label}
    </div>
  );
}

function ProjectStepper({ status }) {
  const active = DB_TO_VISUAL[status] ?? 0;
  const isError = status === 3 || status === 4;
  const percent = active === 10 ? 100 : Math.round((active / 10) * 100);

  return (
    <div className="stepper11-wrap">
      <div className="stepper11-header">
        <span className="stepper11-title">TIẾN TRÌNH XÉT DUYỆT ĐỀ ÁN</span>
        <span className={`stepper11-percent ${isError ? 'error' : ''}`}>
          {isError ? '⚠ Hồ sơ cần bổ sung' : `${percent}% hoàn thành`}
        </span>
      </div>
      <div className="stepper11-track">
        <div className="stepper11-line">
          <div className="stepper11-line-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="stepper11-nodes">
          {STEPS_11.map((step, i) => {
            const isDone = i < active && !isError;
            const isCurrent = i === active;
            const isErrorStep = isError && isCurrent;
            let cls = 'sn-node';
            if (isDone) cls += ' sn-done';
            if (isCurrent && !isError) cls += ' sn-current';
            if (isErrorStep) cls += ' sn-error';
            return (
              <div key={i} className="sn-item">
                <div className={cls}>
                  {isDone ? <CheckCircle size={13} /> : step.isLast ? '🏆' : (i + 1)}
                </div>
                <div className="sn-label">
                  {step.label.split('\n').map((l, j) => <span key={j}>{l}</span>)}
                </div>
                {isCurrent && !isError && <div className="sn-tag">◆ HIỆN TẠI</div>}
                {isErrorStep && <div className="sn-tag error">◆ BỔ SUNG</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatVND(amount) {
  if (!amount && amount !== 0) return '—';
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' Tỷ';
  if (amount >= 1_000_000) return Math.round(amount / 1_000_000) + ' Triệu';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function ActionDropdown({ item, onViewDetail, onRefresh, showConfirm, showAlert, showPrompt }) {
  const ref = useRef(null);
  const userRole = localStorage.getItem('role') || '';

  const handleNop = async () => {
    if (!await showConfirm('Bạn có chắc chắn muốn nộp hồ sơ đề án này?')) return;
    try {
      await api.post(`/dean/${item.id}/nop`);
      await showAlert('Nộp hồ sơ thành công!');
      onRefresh();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi khi nộp hồ sơ.');
    }
  };

  const handleDuyet = async () => {
    const nextText = item.trangThai === 1 ? 'duyệt thẩm định'
      : item.trangThai === 2 ? 'phê duyệt kế hoạch'
      : item.trangThai === 5 ? 'ký hợp đồng thực hiện'
      : item.trangThai === 6 ? 'nghiệm thu đề án'
      : 'quyết toán đề án';
    if (!await showConfirm(`Bạn có chắc chắn muốn ${nextText} đề án này?`)) return;
    try {
      await api.post(`/dean/${item.id}/duyet?currentTrangThai=${item.trangThai}`);
      await showAlert('Duyệt hồ sơ thành công!');
      onRefresh();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi khi duyệt hồ sơ.');
    }
  };

  const handleTraVe = async () => {
    const lyDo = await showPrompt('Nhập lý do yêu cầu sửa đổi/bổ sung:');
    if (lyDo === null) return;
    if (!lyDo.trim()) {
      await showAlert('Vui lòng nhập lý do.');
      return;
    }
    try {
      await api.post(`/dean/${item.id}/tra-ve`, JSON.stringify(lyDo), {
        headers: { 'Content-Type': 'application/json' }
      });
      await showAlert('Đã trả lại yêu cầu bổ sung.');
      onRefresh();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi khi trả lại hồ sơ.');
    }
  };

  const isCoSo = userRole === 'Role_CoSo' || userRole === '1';
  const isSo = userRole === 'Role_So' || userRole === '2';
  const isBo = userRole === 'Role_Bo' || userRole === '3';
  const isAdmin = userRole === 'Role_Admin' || userRole === '4';
  const isTTKC = userRole === 'Role_TTKC' || userRole === '5';

  const showNop = (isCoSo || isTTKC || isAdmin) && (item.trangThai === 0 || item.trangThai === 3);
  const showDuyetSo = (isSo || isAdmin) && (item.trangThai === 1);
  const showDuyetBo = (isBo || isAdmin) && (item.trangThai === 2);
  const showKyHopDong = (isSo || isBo || isAdmin) && (item.trangThai === 5);
  const showNghiemThu = (isSo || isAdmin) && (item.trangThai === 6);
  const showQuyetToan = (isBo || isAdmin) && (item.trangThai === 7);

  const hasActions = showNop || showDuyetSo || showDuyetBo || showKyHopDong || showNghiemThu || showQuyetToan;

  return (
    <div className="action-dropdown" ref={ref}>
      <button
        className="action-trigger"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <Wrench size={13} />
        <span>Thao tác</span>
        <ChevronDown size={12} className="chevron" />
      </button>

      {hasActions && (
        <div className="action-menu" onClick={e => e.stopPropagation()}>
          <div className="action-menu-header">Hành động khả dụng</div>
          <div className="action-menu-body">
            <button
              className="action-menu-item"
              onClick={() => { onViewDetail(item); }}
            >
              <div className="action-icon"><Eye size={14} /></div>
              Chi tiết hồ sơ
            </button>

            {showNop && (
              <button 
                className="action-menu-item success"
                onClick={() => { handleNop(); }}
              >
                <div className="action-icon success"><CheckCircle size={14} /></div>
                Nộp hồ sơ
              </button>
            )}

            {showDuyetSo && (
              <>
                <button 
                  className="action-menu-item success"
                  onClick={() => { handleDuyet(); }}
                >
                  <div className="action-icon success"><CheckCircle size={14} /></div>
                  Duyệt thẩm định
                </button>
                <button 
                  className="action-menu-item danger"
                  onClick={() => { handleTraVe(); }}
                >
                  <div className="action-icon danger"><XCircle size={14} /></div>
                  Yêu cầu sửa
                </button>
              </>
            )}

            {showDuyetBo && (
              <>
                <button 
                  className="action-menu-item success"
                  onClick={() => { handleDuyet(); }}
                >
                  <div className="action-icon success"><CheckCircle size={14} /></div>
                  Phê duyệt đề án
                </button>
                <button 
                  className="action-menu-item danger"
                  onClick={() => { handleTraVe(); }}
                >
                  <div className="action-icon danger"><XCircle size={14} /></div>
                  Yêu cầu sửa
                </button>
              </>
            )}

            {showKyHopDong && (
              <button 
                className="action-menu-item success"
                onClick={() => { handleDuyet(); }}
              >
                <div className="action-icon success"><CheckCircle size={14} /></div>
                Ký hợp đồng
              </button>
            )}

            {showNghiemThu && (
              <button 
                className="action-menu-item success"
                onClick={() => { handleDuyet(); }}
              >
                <div className="action-icon success"><CheckCircle size={14} /></div>
                Nghiệm thu đề án
              </button>
            )}

            {showQuyetToan && (
              <button 
                className="action-menu-item success"
                onClick={() => { handleDuyet(); }}
              >
                <div className="action-icon success"><CheckCircle size={14} /></div>
                Quyết toán đề án
              </button>
            )}

            {!hasActions && (
              <div className="p-3 text-xs text-slate-400 text-center">
                Không có hành động bổ sung cho trạng thái này
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomDialog({ dialog, setDialog }) {
  if (!dialog.isOpen) return null;

  const close = () => setDialog({ ...dialog, isOpen: false });
  
  const handleConfirm = () => {
    if (dialog.type === 'prompt') {
      const val = document.getElementById('dialog-prompt-input').value;
      if (dialog.onConfirm) dialog.onConfirm(val);
    } else {
      if (dialog.onConfirm) dialog.onConfirm(true);
    }
    close();
  };
  
  const handleCancel = () => {
    if (dialog.onConfirm) dialog.onConfirm(dialog.type === 'prompt' ? null : false);
    close();
  };

  const isAlert = dialog.type === 'alert';
  const isPrompt = dialog.type === 'prompt';

  return (
    <div className="custom-dialog-overlay animate-backdrop">
      <div className="custom-dialog-modal animate-popup">
        <div className="custom-dialog-body-flex">
          <div className="custom-dialog-icon-col">
            <div className={`custom-dialog-icon-circle ${isAlert ? 'bg-blue' : 'bg-red'}`}>
              {isAlert ? <Info size={24} strokeWidth={2.5} /> : <HelpCircle size={24} strokeWidth={2.5} />}
            </div>
          </div>
          
          <div className="custom-dialog-content-col">
            <h3 className="custom-dialog-title">
              {isAlert ? 'Thông báo' : isPrompt ? 'Nhập thông tin' : 'Xác nhận'}
            </h3>
            <p className="custom-dialog-message">{dialog.message}</p>
            {isPrompt && (
              <input 
                type="text" 
                id="dialog-prompt-input" 
                className="custom-dialog-input" 
                autoFocus 
              />
            )}
            
            <div className="custom-dialog-footer">
              {!isAlert && (
                <button onClick={handleCancel} className="custom-dialog-btn btn-text-cancel">
                  Bỏ qua
                </button>
              )}
              <button onClick={handleConfirm} className="custom-dialog-btn btn-red-confirm">
                {isAlert ? 'Đóng' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function DashboardPage() {
  const navigate = useNavigate();
  const [allDeAns, setAllDeAns] = useState([]);
  const [linhVucs, setLinhVucs] = useState([]);
  const [activeMapTab, setActiveMapTab] = useState(1);
  
  // States cho Table và thao tác
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });

  const showConfirm = (message) => new Promise(resolve => setDialog({ isOpen: true, type: 'confirm', message, onConfirm: resolve }));
  const showAlert = (message) => new Promise(resolve => setDialog({ isOpen: true, type: 'alert', message, onConfirm: resolve }));
  const showPrompt = (message) => new Promise(resolve => setDialog({ isOpen: true, type: 'prompt', message, onConfirm: resolve }));
  
  const userRole = localStorage.getItem('role') || '4';
  const isCoSo = userRole === 'Role_CoSo' || userRole === '1';
  const isSo = userRole === 'Role_So' || userRole === '2';
  const isBo = userRole === 'Role_Bo' || userRole === '3';
  const isAdmin = userRole === 'Role_Admin' || userRole === '4';
  const isTTKC = userRole === 'Role_TTKC' || userRole === '5';

  useEffect(() => {
    Promise.all([
      api.get('/linhvuc'),
      api.get('/dean?page=1&pageSize=100')
    ]).then(([lvRes, daRes]) => {
      setLinhVucs(lvRes.data || []);
      const daList = daRes.data?.Items || daRes.data?.items || daRes.data?.data || (Array.isArray(daRes.data) ? daRes.data : []);
      // Filter list for CNNT client-side
      if (userRole === 'Role_CoSo' || userRole === '1') {
        const userDonViId = localStorage.getItem('donViId');
        setAllDeAns(daList.filter(d => d.donViThuHuongId === userDonViId || d.donViThiCongId === userDonViId));
      } else {
        setAllDeAns(daList);
      }
    }).catch(err => console.error('Lỗi khi tải dữ liệu dashboard:', err));
  }, [refreshTrigger, userRole]);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
  
  const inProgressCount = allDeAns.filter(x => x.trangThai === 6).length;
  const totalKinhPhiDuKien = allDeAns.reduce((sum, da) => sum + (da.kinhPhiDuKien || 0), 0);
  
  const lvTopData = linhVucs.slice(0, 6);
  const lvLabels = lvTopData.map(lv => lv.tenLinhVuc?.length > 20 ? lv.tenLinhVuc.substring(0, 20) + '...' : (lv.tenLinhVuc || 'Khác'));

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatCompactCurrency = (val) => {
    if (!val) return '0 ₫';
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' Tỷ';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Tr';
    return formatCurrency(val);
  };

  const totalReal = allDeAns.length;
  
  const trendData1 = {
    labels: years,
    datasets: [
      { label: 'Số lượng Đề án', data: [totalReal - 10, totalReal - 5, totalReal - 2, totalReal + 3, totalReal], borderColor: '#3b82f6', backgroundColor: '#3b82f622', fill: true, tension: 0.4 },
      { label: 'Doanh nghiệp thụ hưởng', data: [totalReal - 12, totalReal - 8, totalReal - 5, totalReal, totalReal + 2], borderColor: '#10b981', backgroundColor: '#10b98122', fill: true, tension: 0.4 },
      { label: 'Đề án đang thực hiện', data: [2, 5, 4, inProgressCount > 0 ? inProgressCount - 1 : 2, inProgressCount], borderColor: '#f59e0b', backgroundColor: '#f59e0b22', fill: true, tension: 0.4, borderDash: [5, 5] }
    ]
  };

  const trendData2 = {
    labels: years,
    datasets: [
      { label: 'Kinh phí Dự kiến (Tỷ VNĐ)', data: [12.5, 18.2, 25.4, 30.1, (totalKinhPhiDuKien/1e9).toFixed(1)], borderColor: '#64748b', backgroundColor: '#64748b11', fill: true, tension: 0.4, borderDash: [5, 5] },
      { label: 'Kinh phí Đã thực hiện (Tỷ VNĐ)', data: [10.2, 15.5, 22.1, 28.5, ((totalKinhPhiDuKien*0.7)/1e9).toFixed(1)], borderColor: '#0f172a', backgroundColor: '#0f172a11', fill: true, tension: 0.4 }
    ]
  };

  const pieChartData = {
    labels: lvLabels,
    datasets: [{ data: lvTopData.map(lv => allDeAns.filter(da => da.linhVucId === lv.id).length), backgroundColor: COLORS.slice(0, lvTopData.length), borderWidth: 0, hoverOffset: 4 }]
  };

  const barBudgetField = {
    labels: lvLabels,
    datasets: [{ label: 'Kinh phí (VNĐ)', data: lvTopData.map(lv => allDeAns.filter(da => da.linhVucId === lv.id).reduce((s, da) => s + (da.kinhPhiDuKien || 0), 0)), backgroundColor: '#f59e0b', borderRadius: 4 }]
  };

  const hBarCompanyField = {
    labels: lvLabels,
    datasets: [{ label: 'Số Đơn vị thụ hưởng', data: lvTopData.map(lv => allDeAns.filter(da => da.linhVucId === lv.id).length), backgroundColor: '#14b8a6', borderRadius: 4 }]
  };

  const groupedBarData = {
    labels: years,
    datasets: [
      { label: lvLabels[0] || 'Lĩnh vực 1', data: [10, 15, 12, 18, allDeAns.filter(da => da.linhVucId === lvTopData[0]?.id).length], backgroundColor: COLORS[0] },
      { label: lvLabels[1] || 'Lĩnh vực 2', data: [5, 8, 15, 10, allDeAns.filter(da => da.linhVucId === lvTopData[1]?.id).length], backgroundColor: COLORS[1] }
    ]
  };

  const radarData = {
    labels: ['Việc làm mới', 'Tăng thu nhập', 'Tăng thu NSNN', 'Đổi mới công nghệ', 'Phát triển OCOP'],
    datasets: [
      { label: 'Kỳ vọng (KPI)', data: [80, 75, 90, 85, 70], backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', pointBackgroundColor: '#10b981' },
      { label: 'Thực tế', data: [85, 80, 88, 92, 65], backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', pointBackgroundColor: '#3b82f6' }
    ]
  };

  const handleModalNop = async () => {
    if (!await showConfirm('Bạn có chắc chắn muốn nộp hồ sơ đề án này?')) return;
    try {
      await api.post(`/dean/${selectedItem.id}/nop`);
      await showAlert('Nộp hồ sơ thành công!');
      setSelectedItem(null);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      await showAlert('Lỗi khi nộp hồ sơ.');
    }
  };

  const handleModalDuyet = async () => {
    const nextText = selectedItem.trangThai === 1 ? 'duyệt thẩm định'
      : selectedItem.trangThai === 2 ? 'phê duyệt kế hoạch'
      : selectedItem.trangThai === 5 ? 'ký hợp đồng thực hiện'
      : selectedItem.trangThai === 6 ? 'nghiệm thu đề án'
      : 'quyết toán đề án';
    if (!await showConfirm(`Bạn có chắc chắn muốn ${nextText} đề án này?`)) return;
    try {
      await api.post(`/dean/${selectedItem.id}/duyet?currentTrangThai=${selectedItem.trangThai}`);
      await showAlert('Duyệt hồ sơ thành công!');
      setSelectedItem(null);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      await showAlert('Lỗi khi duyệt hồ sơ.');
    }
  };

  const handleModalTraVe = async () => {
    if (!rejectReason.trim()) {
      await showAlert('Vui lòng nhập lý do trả hồ sơ / nhận xét.');
      return;
    }
    try {
      await api.post(`/dean/${selectedItem.id}/tra-ve`, JSON.stringify(rejectReason), {
        headers: { 'Content-Type': 'application/json' }
      });
      await showAlert('Đã trả lại yêu cầu bổ sung.');
      setRejecting(false);
      setRejectReason('');
      setSelectedItem(null);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      alert('Lỗi khi trả lại hồ sơ.');
    }
  };


  return (
    <div className="db-container">
      <div className="db-header">
        <h1 className="db-title">
          <Activity color="#d97706" size={28} />
          BẢNG ĐIỀU KHIỂN QUẢN TRỊ (ADMIN)
        </h1>
        <p className="db-subtitle">Tổng quan toàn diện số liệu Khuyến Công Quốc Gia (Theo tài liệu V2)</p>
      </div>

      <div className="db-grid-4">
        <div className="stat-card blue">
          <div className="stat-info"><p className="stat-label">Tổng đề án KC</p><p className="stat-value">{allDeAns.length}</p></div>
          <div className="stat-icon blue"><FileText size={24} /></div>
        </div>
        <div className="stat-card green">
          <div className="stat-info"><p className="stat-label">DN Thụ hưởng</p><p className="stat-value">{allDeAns.length > 0 ? allDeAns.length + 12 : 0}</p></div>
          <div className="stat-icon green"><Activity size={24} /></div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-info"><p className="stat-label">Tổng Kinh phí KH</p><p className="stat-value">{formatCompactCurrency(totalKinhPhiDuKien)}</p></div>
          <div className="stat-icon yellow"><DollarSign size={24} /></div>
        </div>
        <div className="stat-card purple">
          <div className="stat-info"><p className="stat-label">Đang thực hiện</p><p className="stat-value">{inProgressCount}</p></div>
          <div className="stat-icon purple"><Clock size={24} /></div>
        </div>
      </div>

      <h2 className="section-title"><TrendingUp size={20} color="#0f172a" /> Xu Hướng Theo Thời Gian</h2>
      <div className="db-grid-2">
        <div className="db-panel">
          <h3 className="panel-title">1. Đề án & Doanh nghiệp (2020-{currentYear})</h3>
          <div className="chart-container">
            <Line data={trendData1} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }} />
          </div>
        </div>
        <div className="db-panel">
          <h3 className="panel-title">2. Kinh phí Khuyến công Thực hiện vs Dự kiến</h3>
          <div className="chart-container">
            <Line data={trendData2} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }} />
          </div>
        </div>
      </div>

      <h2 className="section-title"><PieChartIcon size={20} color="#0f172a" /> Phân Tích Lĩnh Vực</h2>
      <div className="db-grid-3">
        <div className="db-panel">
          <h3 className="panel-title">3. Tỷ lệ hỗ trợ theo Lĩnh vực</h3>
          <div className="chart-container chart-container-sm">
            <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
          </div>
        </div>
        <div className="db-panel">
          <h3 className="panel-title">4. Kinh phí thực hiện (VNĐ)</h3>
          <div className="chart-container chart-container-sm">
            <Bar data={barBudgetField} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => v >= 1000000000 ? v / 1000000000 + ' Tỷ' : v >= 1000000 ? v / 1000000 + ' Tr' : v } } } }} />
          </div>
        </div>
        <div className="db-panel">
          <h3 className="panel-title">5. Đơn vị thụ hưởng</h3>
          <div className="chart-container chart-container-sm">
            <Bar data={hBarCompanyField} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <h2 className="section-title"><Target size={20} color="#0f172a" /> Hiệu Quả Đề Án</h2>
      <div className="db-grid-2-custom">
        <div className="db-panel">
          <h3 className="panel-title">6. Đề án theo Lĩnh vực (Theo năm)</h3>
          <div className="chart-container chart-container-sm">
            <Bar data={groupedBarData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }} />
          </div>
        </div>
        <div className="db-panel">
          <h3 className="panel-title">7. Hiệu quả DA so với Chỉ số KC</h3>
          <div className="chart-container chart-container-sm">
            <Radar data={radarData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }} />
          </div>
        </div>
      </div>

      <h2 className="section-title"><Map size={20} color="#0f172a" /> Bản Đồ Phân Bổ Địa Phương</h2>
      <div className="db-panel" style={{ marginBottom: '2rem' }}>
        <h3 className="panel-title">8. Bản đồ GIS Phân bổ (3 lớp)</h3>
        <div className="map-tabs">
          <button className={`map-tab ${activeMapTab === 1 ? 'active' : ''}`} onClick={() => setActiveMapTab(1)}>DN Thụ hưởng</button>
          <button className={`map-tab ${activeMapTab === 2 ? 'active' : ''}`} onClick={() => setActiveMapTab(2)}>Hội nghị XTTM</button>
          <button className={`map-tab ${activeMapTab === 3 ? 'active' : ''}`} onClick={() => setActiveMapTab(3)}>Sản phẩm OCOP</button>
        </div>
        <div className="map-wrapper">
          <MapContainer center={[16.047079, 108.206230]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {activeMapTab === 1 && (
              <>
                <Marker position={[21.028511, 105.804817]}><Popup>Hà Nội<br/>15 Doanh nghiệp</Popup></Marker>
                <Marker position={[10.823099, 106.629662]}><Popup>TP. Hồ Chí Minh<br/>20 Doanh nghiệp</Popup></Marker>
                <Marker position={[16.047079, 108.206230]}><Popup>Đà Nẵng<br/>8 Doanh nghiệp</Popup></Marker>
              </>
            )}
            {activeMapTab === 2 && (
              <>
                <Marker position={[20.8449, 106.6881]}><Popup>Hải Phòng<br/>Hội chợ XTTM Công thương 2024</Popup></Marker>
                <Marker position={[12.2388, 109.1967]}><Popup>Nha Trang<br/>Triển lãm SP Khuyến công Nam Trung Bộ</Popup></Marker>
              </>
            )}
            {activeMapTab === 3 && (
              <>
                <Marker position={[21.5833, 105.8167]}><Popup>Thái Nguyên<br/>Chè Tân Cương (4 Sao OCOP)</Popup></Marker>
                <Marker position={[10.0452, 105.7469]}><Popup>Cần Thơ<br/>Đồ thủ công Gáo dừa (3 Sao OCOP)</Popup></Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>

      {/* DANH SÁCH ĐỀ ÁN (GIAO DIỆN QUẢN LÝ ĐỀ ÁN) */}
      <div className="deal-page-header" style={{ marginTop: '2rem' }}>
        <div className="deal-page-title-block">
          <h1 className="deal-page-title">Đề Án Mới Cập Nhật</h1>
          <p className="deal-page-sub">Xem nhanh {Math.min(5, allDeAns.length)} đề án</p>
        </div>
        <div className="deal-header-actions">
          <button className="btn-create" onClick={() => navigate('/de-an')}>Xem tất cả &rarr;</button>
        </div>
      </div>
      
      <div className="deal-panel" style={{ padding: '0', background: 'none', boxShadow: 'none' }}>
        <div className="deal-table-wrapper" style={{ borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="deal-table">
            <thead>
              <tr>
                <th>MÃ ĐA</th>
                <th>TÊN & PHÂN LOẠI</th>
                <th>ĐƠN VỊ THỤ HƯỞNG</th>
                <th className="th-right">KINH PHÍ</th>
                <th className="th-center">TRẠNG THÁI</th>
                <th className="th-center">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {allDeAns.slice(0, 5).length === 0 ? (
                <tr>
                  <td colSpan={6} className="deal-empty">
                    <FolderOpen size={36} style={{ opacity: 0.25, marginBottom: 8 }} />
                    <div>Không có dữ liệu đề án</div>
                  </td>
                </tr>
              ) : (
                allDeAns.slice(0, 5).map(item => {
                  const lh = linhVucs.find(l => l.id === item.linhVucId)?.tenLinhVuc || 'Khuyến công địa phương';
                  return (
                    <tr
                      key={item.id}
                      className="deal-row"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="td-code">{item.maDeAn || '—'}</td>
                      <td className="td-name">
                        <div className="td-name-main">{item.tenDeAn}</div>
                        <div className="td-name-sub">{lh}</div>
                      </td>
                      <td className="td-company">
                        {item.tenDonViThuHuong || <span className="td-empty">—</span>}
                      </td>
                      <td className="td-budget">
                        {formatVND(item.kinhPhiDuKien)}
                      </td>
                      <td className="td-status">
                        <StatusBadge status={item.trangThai} />
                        <WorkflowBar status={item.trangThai} />
                      </td>
                      <td className="td-action" onClick={e => e.stopPropagation()}>
                        <ActionDropdown
                          item={item}
                          onViewDetail={() => setSelectedItem(item)}
                          onRefresh={() => setRefreshTrigger(p => p + 1)}
                          showConfirm={showConfirm}
                          showAlert={showAlert}
                          showPrompt={showPrompt}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL PANEL MODAL (GIỐNG HỆT QUẢN LÝ ĐỀ ÁN) */}
      {selectedItem && (
        <div className="detail-overlay" onClick={() => { setSelectedItem(null); setRejecting(false); setRejectReason(''); }}>
          <div className="detail-modal-v2" onClick={e => e.stopPropagation()}>

            <div className="dmv2-header">
              <h3 className="dmv2-title">{selectedItem.tenDeAn}</h3>
              <button className="dmv2-close" onClick={() => setSelectedItem(null)}><X size={20}/></button>
            </div>

            <div className="dmv2-stepper">
              <ProjectStepper status={selectedItem.trangThai} />
            </div>

            <div className="dmv2-body">
              <div className="dm-grid-cards">
                <div className="dm-card-cell">
                  <div className="dm-cell-label">MÃ ĐỀ ÁN</div>
                  <div className="dm-cell-value mono">{selectedItem.maDeAn || '—'}</div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">LOẠI ĐỀ ÁN</div>
                  <div className="dm-cell-value">{selectedItem.tenLoaiDeAn || 'Khuyến công địa phương'}</div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">LĨNH VỰC</div>
                  <div className="dm-cell-value">{linhVucs.find(l => l.id === selectedItem.linhVucId)?.tenLinhVuc || '—'}</div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">ĐƠN VỊ THỤ HƯỞNG</div>
                  <div className="dm-cell-value highlight">{selectedItem.tenDonViThuHuong || '—'}</div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">THỜI GIAN THỰC HIỆN</div>
                  <div className="dm-cell-value">
                    {selectedItem.thoiGianBatDau ? new Date(selectedItem.thoiGianBatDau).toLocaleDateString('vi-VN') : '—'} → {selectedItem.thoiGianKetThuc ? new Date(selectedItem.thoiGianKetThuc).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">KINH PHÍ DỰ KIẾN</div>
                  <div className="dm-cell-value finance">{formatVND(selectedItem.kinhPhiDuKien)}</div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">NGUỒN KINH PHÍ</div>
                  <div className="dm-cell-value">{selectedItem.nguonKinhPhi || 'NS Trung ương'}</div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">ĐỊA ĐIỂM</div>
                  <div className="dm-cell-value">{selectedItem.diaChi || '—'}</div>
                </div>
              </div>

              {selectedItem.trangThai >= 5 && (
                <div className="dm-grid-cards">
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐƠN VỊ THI CÔNG</div>
                    <div className="dm-cell-value">{selectedItem.tenDonViThiCong || selectedItem.donViThiCongText || '—'}</div>
                  </div>
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐƠN VỊ GIÁM SÁT</div>
                    <div className="dm-cell-value">{selectedItem.donViGiamSat || '—'}</div>
                  </div>
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐÃ TẠM ỨNG</div>
                    <div className="dm-cell-value warn">{selectedItem.kinhPhiTamUng === 0 ? '0' : formatVND(selectedItem.kinhPhiTamUng || 0)}</div>
                  </div>
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐÃ QUYẾT TOÁN</div>
                    <div className="dm-cell-value success-green">{selectedItem.kinhPhiQuyetToan === 0 ? '0' : formatVND(selectedItem.kinhPhiQuyetToan || 0)}</div>
                  </div>
                </div>
              )}

              <div className="dm-status-card">
                <span className="dm-status-label">Trạng thái hiện tại:</span>
                <span className="dm-status-badge"><StatusBadge status={selectedItem.trangThai}/></span>
              </div>

              {selectedItem.trangThai >= 5 && (() => {
                const tu = selectedItem.kinhPhiTamUng || 0;
                const qt = selectedItem.kinhPhiQuyetToan || 0;
                const total = selectedItem.kinhPhiDuKien || 1;
                const pctTU = Math.min(100, Math.round(tu / total * 100));
                const pctQT = Math.min(100 - pctTU, Math.round(qt / total * 100));
                const pctAll = Math.min(100, pctTU + pctQT);
                return (
                  <div className="dm-giaingan-card">
                    <div className="dm-giaingan-header">
                      <span className="dm-cell-label" style={{textTransform: 'none', fontSize: '13px', fontWeight: 700}}>Tiến độ giải ngân (Tạm ứng + Quyết toán)</span>
                      <span className="dm-giaingan-num">{formatVND(tu + qt)} / {formatVND(total)} ({pctAll}%)</span>
                    </div>
                    <div className="dm-giaingan-bar">
                      <div className="dm-giaingan-tu" style={{ width: `${pctTU}%` }} />
                      <div className="dm-giaingan-qt" style={{ width: `${pctQT}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="detail-modal-footer-advanced">
              {(() => {
                const item = selectedItem;
                const showNop = (isCoSo || isTTKC || isAdmin) && (item.trangThai === 0 || item.trangThai === 3);
                const showDuyetSo = (isSo || isAdmin) && item.trangThai === 1;
                const showDuyetBo = (isBo || isAdmin) && item.trangThai === 2;
                const showKyHopDong = (isSo || isBo || isAdmin) && item.trangThai === 5;
                const showNghiemThu = (isSo || isAdmin) && item.trangThai === 6;
                const showQuyetToan = (isBo || isAdmin) && item.trangThai === 7;
                const hasActions = showNop || showDuyetSo || showDuyetBo || showKyHopDong || showNghiemThu || showQuyetToan;
                const isTraVe = showDuyetSo || showDuyetBo;

                if (rejecting) return (
                  <div className="reject-form">
                    <h4 className="reject-title">Lý do yêu cầu bổ sung / Trả hồ sơ</h4>
                    <textarea className="reject-textarea" placeholder="Nhập chi tiết lý do, nhận xét để Cơ sở chỉnh sửa..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}/>
                    <div className="reject-attachment">
                      <label className="reject-file-label"><input type="file" className="reject-file-input"/><FileText size={14}/> Đính kèm file (tùy chọn)</label>
                      <span className="reject-file-hint">* Upload file sẽ được hỗ trợ khi Backend sẵn sàng</span>
                    </div>
                    <div className="reject-actions">
                      <button className="btn-reject-cancel" onClick={() => setRejecting(false)}>Hủy</button>
                      <button className="btn-reject-confirm" onClick={handleModalTraVe}>Xác nhận Trả hồ sơ</button>
                    </div>
                  </div>
                );

                return (
                  <div className="detail-action-bar">
                    <div className="detail-status-hint">
                      <span className={`hint-text ${hasActions ? 'active' : ''}`}>
                        {hasActions ? <><CheckCircle size={14}/> Hồ sơ cần bạn xử lý ở bước này.</> : <><Clock size={14}/> {item.trangThai >= 8 ? 'Đề án đã hoàn tất.' : 'Đang chờ cấp có thẩm quyền xử lý.'}</>}
                      </span>
                    </div>
                    <div className="detail-action-buttons">
                      <button className="detail-btn-close" onClick={() => setSelectedItem(null)}>Đóng</button>
                      {showNop && <button className="btn-action-primary" onClick={handleModalNop}>Nộp hồ sơ</button>}
                      {(showDuyetSo || showDuyetBo || showKyHopDong || showNghiemThu || showQuyetToan) && (
                        <button className="btn-action-primary" onClick={handleModalDuyet}>
                          <CheckCircle size={15}/> Phê duyệt
                        </button>
                      )}
                      {isTraVe && (
                        <button className="btn-action-danger" onClick={() => setRejecting(true)}>
                          <XCircle size={15}/> Yêu cầu bổ sung
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Global Custom Dialog */}
      <CustomDialog dialog={dialog} setDialog={setDialog} />
    </div>
  );
}

export default DashboardPage;
