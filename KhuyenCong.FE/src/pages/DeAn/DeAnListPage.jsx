import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileSpreadsheet, Search, ChevronDown,
  Eye, Wrench, CheckCircle, XCircle, Clock,
  FolderOpen, RefreshCw, X, HelpCircle, Info
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import './DeAnList.css';

// ── TRẠNG THÁI ĐỀ ÁN (9 trạng thái đồng bộ với Backend) ──────────────────────────
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

// Map trạng thái DB (0-8) → chỉ số bước hiển thị (0-10)
const DB_TO_VISUAL = { 0: 0, 1: 1, 2: 2, 3: 1, 4: 2, 5: 3, 6: 6, 7: 8, 8: 9 };

// 11 nút (10 bước + Hoàn tất) theo đúng quy trình khuyến công quốc gia
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

// ── ACTION DROPDOWN ────────────────────────────────────────────────────────────
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

  // Logic hiển thị hành động khả dụng theo vai trò và trạng thái
  const isCoSo = userRole === 'Role_CoSo' || userRole === '1';
  const isSo = userRole === 'Role_So' || userRole === '2';
  const isBo = userRole === 'Role_Bo' || userRole === '3';
  const isAdmin = userRole === 'Role_Admin' || userRole === '4';
  const isTTKC = userRole === 'Role_TTKC' || userRole === '5';

  const showNop = (isCoSo || isTTKC || isAdmin) && (item.trangThai === 0 || item.trangThai === 3);
  
  const showDuyetSo = (isSo || isAdmin) && (item.trangThai === 1);
  const showDuyetBo = (isBo || isAdmin) && (item.trangThai === 2);
  
  // Trạng thái nâng cao
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

// ── CUSTOM DIALOG COMPONENT ───────────────────────────────────────────────────
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
          {/* Cột Icon bên trái */}
          <div className="custom-dialog-icon-col">
            <div className={`custom-dialog-icon-circle ${isAlert ? 'bg-blue' : 'bg-red'}`}>
              {isAlert ? <Info size={24} strokeWidth={2.5} /> : <HelpCircle size={24} strokeWidth={2.5} />}
            </div>
          </div>
          
          {/* Cột Nội dung bên phải */}
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
            
            {/* Footer nằm ngay trong cột bên phải (như prototype) */}
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

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
function DeAnListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [linhVucs, setLinhVucs] = useState([]);
  const [linhVucFilter, setLinhVucFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Custom Dialog State
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });

  const showConfirm = (message) => {
    return new Promise(resolve => {
      setDialog({ isOpen: true, type: 'confirm', message, onConfirm: resolve });
    });
  };

  const showAlert = (message) => {
    return new Promise(resolve => {
      setDialog({ isOpen: true, type: 'alert', message, onConfirm: resolve });
    });
  };

  const showPrompt = (message) => {
    return new Promise(resolve => {
      setDialog({ isOpen: true, type: 'prompt', message, onConfirm: resolve });
    });
  };
  
  const fileInputRef = useRef(null);

  const userRole = localStorage.getItem('role') || '4';
  const isCoSo = userRole === 'Role_CoSo' || userRole === '1';
  const isSo = userRole === 'Role_So' || userRole === '2';
  const isBo = userRole === 'Role_Bo' || userRole === '3';
  const isAdmin = userRole === 'Role_Admin' || userRole === '4';
  const isTTKC = userRole === 'Role_TTKC' || userRole === '5';

  useEffect(() => { 
    fetchData(); 
    fetchLinhVuc(); 
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dean?page=1&pageSize=100');
      const raw = res.data;
      const list = raw?.Items || raw?.items || raw?.data || (Array.isArray(raw) ? raw : []);
      
      // Filter list for CNNT client-side
      if (userRole === 'Role_CoSo' || userRole === '1') {
        const userDonViId = localStorage.getItem('donViId');
        setData(list.filter(d => d.donViThuHuongId === userDonViId || d.donViThiCongId === userDonViId));
      } else {
        setData(list);
      }
    } catch (err) {
      console.error('Lỗi khi tải đề án:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinhVuc = async () => {
    try {
      const res = await api.get('/linhvuc');
      setLinhVucs(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const filtered = data.filter(item => {
    const matchSearch = !search ||
      item.tenDeAn?.toLowerCase().includes(search.toLowerCase()) ||
      item.maDeAn?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || String(item.trangThai) === statusFilter;
    const matchLv = !linhVucFilter || item.linhVucId === linhVucFilter;
    return matchSearch && matchStatus && matchLv;
  });

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        alert("File Excel trống hoặc không đúng định dạng!");
        return;
      }

      // Xử lý giá trị mặc định cho Lĩnh vực, Loại đề án, Đơn vị
      const defaultLinhVucId = linhVucs.length > 0 ? linhVucs[0].id : "00000000-0000-0000-0000-000000000000";
      // Lấy danh sách Loại đề án mặc định (nếu có thể)
      let defaultLoaiDeAnId = "00000000-0000-0000-0000-000000000000";
      try {
        const ldaRes = await api.get('/loaidean');
        if (ldaRes.data && ldaRes.data.length > 0) defaultLoaiDeAnId = ldaRes.data[0].id;
      } catch (e) {}

      let defaultDonViId = localStorage.getItem('donViId'); 
      if (!defaultDonViId) {
         defaultDonViId = "00000000-0000-0000-0000-000000000000";
      }

      let countSuccess = 0;
      for (const row of json) {
        const payload = {
          tenDeAn: row['Tên Đề Án'] || row['TenDeAn'] || row['TÊN ĐỀ ÁN'] || 'Đề án Import từ Excel',
          maDeAn: row['Mã Đề Án'] || row['MaDeAn'] || row['MÃ ĐỀ ÁN'] || `DA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          kinhPhiDuKien: parseFloat(row['Kinh Phí'] || row['KinhPhi'] || row['KINH PHÍ'] || 0),
          linhVucId: defaultLinhVucId,
          loaiDeAnId: defaultLoaiDeAnId,
          donViThuHuongId: defaultDonViId,
          thoiGianBatDau: new Date().toISOString(),
          thoiGianKetThuc: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
          trangThai: 0 // Bản nháp
        };
        try {
          await api.post('/dean', payload);
          countSuccess++;
        } catch (postErr) {
          console.error("Lỗi khi import dòng:", row, postErr);
        }
      }

      alert(`Đã nhập thành công ${countSuccess}/${json.length} đề án từ Excel!`);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đọc file Excel: " + err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
    // Gửi lyDo (kèm thông tin file nếu có xử lý ở tương lai)
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
    <div className="deal-list-page">
      {/* ── PAGE HEADER ── */}
      <div className="deal-page-header">
        <div className="deal-page-title-block">
          <h1 className="deal-page-title">Quản lý Đề án Khuyến công</h1>
          <p className="deal-page-sub">{filtered.length} đề án</p>
        </div>
        <div className="deal-header-actions">
          <button 
            className="btn-refresh"
            onClick={() => setRefreshTrigger(p => p + 1)}
          >
            <RefreshCw size={15} />
            LÀM MỚI
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
            onChange={handleImportExcel} 
          />
          <button
            className="btn-import-excel"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet size={15} />
            NHẬP EXCEL
          </button>
          <button
            className="btn-create"
            onClick={() => navigate('/de-an/tao-moi')}
          >
            <Plus size={15} />
            TẠO ĐỀ ÁN MỚI
          </button>
        </div>
      </div>

      {/* ── PANEL TABLE ── */}
      <div className="deal-panel">
        {/* Filter bar */}
        <div className="deal-filter-bar">
          <div className="filter-search-box">
            <Search size={14} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Tìm tên, mã đề án..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-search-input"
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={linhVucFilter}
            onChange={e => setLinhVucFilter(e.target.value)}
          >
            <option value="">Tất cả lĩnh vực</option>
            {linhVucs.map(lv => (
              <option key={lv.id} value={lv.id}>{lv.tenLinhVuc}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="deal-table-wrapper">
          {loading ? (
            <div className="deal-loading">
              <div className="deal-loading-spinner" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <table className="deal-table">
              <thead>
                <tr>
                  <th>MÃ ĐA</th>
                  <th>TÊN &amp; PHÂN LOẠI</th>
                  <th>ĐƠN VỊ THỤ HƯỞNG</th>
                  <th className="th-right">KINH PHÍ</th>
                  <th className="th-center">TRẠNG THÁI</th>
                  <th className="th-center">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="deal-empty">
                      <FolderOpen size={36} style={{ opacity: 0.25, marginBottom: 8 }} />
                      <div>Không tìm thấy đề án phù hợp</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => (
                    <tr
                      key={item.id}
                      className="deal-row"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="td-code">{item.maDeAn || '—'}</td>
                      <td className="td-name">
                        <div className="td-name-main">{item.tenDeAn}</div>
                        {item.tenLinhVuc && (
                          <div className="td-name-sub">
                            {item.tenLinhVuc}
                          </div>
                        )}
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── DETAIL PANEL (MODAL CENTER) ── */}
      {selectedItem && (
        <div className="detail-overlay" onClick={() => { setSelectedItem(null); setRejecting(false); setRejectReason(''); }}>
          <div className="detail-modal-v2" onClick={e => e.stopPropagation()}>

            {/* Header màu navy theo prototype */}
            <div className="dmv2-header">
              <h3 className="dmv2-title">{selectedItem.tenDeAn}</h3>
              <button className="dmv2-close" onClick={() => setSelectedItem(null)}><X size={20}/></button>
            </div>

            {/* Stepper 11 bước */}
            <div className="dmv2-stepper">
              <ProjectStepper status={selectedItem.trangThai} />
            </div>

            {/* Body - thông tin 2 cột */}
            <div className="dmv2-body">
              {/* ── Lưới các thông tin đề án rời nhau theo prototype ── */}
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
                  <div className="dm-cell-value">{selectedItem.tenLinhVuc || '—'}</div>
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

              {/* ── Các thông tin thực hiện & Giải ngân (chỉ hiện từ bước Phê duyệt) ── */}
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

              {/* Trạng thái hiện tại - Full width card như ảnh prototype */}
              <div className="dm-status-card">
                <span className="dm-status-label">Trạng thái hiện tại:</span>
                <span className="dm-status-badge"><StatusBadge status={selectedItem.trangThai}/></span>
              </div>

              {/* Tiến độ giải ngân */}
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

            {/* Footer - action theo role */}
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

export default DeAnListPage;
