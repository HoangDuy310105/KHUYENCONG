import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileSpreadsheet, Search, ChevronDown,
  Eye, Wrench, CheckCircle, XCircle, Clock,
  FolderOpen, RefreshCw, X, HelpCircle, Info, FileText,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import { useDialog } from '../../context/DialogContext';
import confetti from 'canvas-confetti';
import DeAnAppraisalModal from './DeAnAppraisalModal';
import './DeAnList.css';

// ── TRẠNG THÁI ĐỀ ÁN (9 trạng thái đồng bộ với Backend) ──────────────────────────
const STATUS_MAP = {
  0: { label: 'Bản Nháp', color: '#64748b', bg: '#f1f5f9' },
  1: { label: 'Chờ Sở Thẩm Định', color: '#d97706', bg: '#fef9ec' },
  2: { label: 'Chờ Cục Thẩm Định', color: '#2563eb', bg: '#eff6ff' },
  3: { label: 'Yêu Cầu Bổ Sung', color: '#b91c1c', bg: '#fef2f2' },
  4: { label: 'Bị Từ Chối', color: '#dc2626', bg: '#fef2f2' },
  5: { label: 'Đã Phê Duyệt', color: '#0369a1', bg: '#f0f9ff' },
  6: { label: 'Đang Thực Hiện', color: '#047857', bg: '#ecfdf5' },
  7: { label: 'Đã Nghiệm Thu', color: '#6d28d9', bg: '#f5f3ff' },
  8: { label: 'Đã Quyết Toán', color: '#2d3a4fff', bg: '#f9fafb' },
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
function ActionDropdown({ item, onViewDetail, onRefresh, showConfirm, showAlert, showPrompt, onOpenUploadModal, onOpenAppraisalModal }) {
  const ref = useRef(null);

  const userRole = localStorage.getItem('role') || '';

  const handleNop = async () => {
    if (!await showConfirm('Bạn có chắc chắn muốn nộp hồ sơ đề án này?')) return;
    try {
      await api.post(`/dean/${item.id}/nop`);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      await showAlert('Nộp hồ sơ thành công!');
      onRefresh();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Lỗi khi nộp hồ sơ.';
      await showAlert(msg);
    }
  };

  const handleDuyet = async () => {
    const nextText = item.trangThai === 1 ? 'duyệt thẩm định'
      : item.trangThai === 7 ? 'quyết toán đề án'
        : 'duyệt';
    if (!await showConfirm(`Bạn có chắc chắn muốn ${nextText} đề án này?`)) return;
    try {
      await api.post(`/dean/${item.id}/duyet?currentTrangThai=${item.trangThai}`);
      await showAlert('Thao tác thành công!');
      onRefresh();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Lỗi khi thao tác hồ sơ.';
      await showAlert(msg);
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
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Lỗi khi trả lại hồ sơ.';
      await showAlert(msg);
    }
  };

  const handleTuChoi = async () => {
    const lyDo = await showPrompt('Nhập lý do từ chối hồ sơ:');
    if (lyDo === null) return;
    if (!lyDo.trim()) {
      await showAlert('Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      await api.post(`/dean/${item.id}/tu-choi`, JSON.stringify(lyDo), {
        headers: { 'Content-Type': 'application/json' }
      });
      await showAlert('Đã từ chối hồ sơ thành công.');
      onRefresh();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Lỗi khi từ chối hồ sơ.';
      await showAlert(msg);
    }
  };

  const handleKyHopDong = () => {
    if (onOpenUploadModal) onOpenUploadModal('ky-hop-dong', item);
  };

  const handleNghiemThu = () => {
    if (onOpenUploadModal) onOpenUploadModal('nghiem-thu', item);
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
  const showKPI = (isSo || isCoSo || isAdmin) && (item.trangThai >= 6);

  const hasActions = showNop || showDuyetSo || showDuyetBo || showKyHopDong || showNghiemThu || showQuyetToan || showKPI;

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
                onClick={() => { onOpenAppraisalModal ? onOpenAppraisalModal(item) : handleDuyet(); }}
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
              <button
                className="action-menu-item danger"
                onClick={() => { handleTuChoi(); }}
              >
                <div className="action-icon danger"><XCircle size={14} /></div>
                Từ chối đề án
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
              <button
                className="action-menu-item danger"
                onClick={() => { handleTuChoi(); }}
              >
                <div className="action-icon danger"><XCircle size={14} /></div>
                Từ chối đề án
              </button>
            </>
          )}

          {showKyHopDong && (
            <button
              className="action-menu-item success"
              onClick={() => { handleKyHopDong(); }}
            >
              <div className="action-icon success"><CheckCircle size={14} /></div>
              Ký hợp đồng
            </button>
          )}

          {showNghiemThu && (
            <button
              className="action-menu-item success"
              onClick={() => { handleNghiemThu(); }}
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

          {showKPI && (
            <button
              className="action-menu-item success"
              onClick={() => { if (onOpenUploadModal) onOpenUploadModal('kpi', item); }}
            >
              <div className="action-icon success"><TrendingUp size={14} /></div>
              Nhập KPI Hiệu quả
            </button>
          )}

          {!hasActions && (
            <div className="p-3 text-xs text-slate-400 text-center">
              Không có hành động bổ sung cho trạng thái này
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CUSTOM DIALOG REMOVED ───────────────────────────────────────────────────

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
  const [rejectFileUrl, setRejectFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadModalData, setUploadModalData] = useState(null); // { type: 'ky-hop-dong' | 'nghiem-thu' | 'kpi', item }
  const [appraisalModalOpen, setAppraisalModalOpen] = useState(false);
  const [appraisalItem, setAppraisalItem] = useState(null);

  const { showAlert: contextShowAlert, showConfirm: contextShowConfirm, showPrompt: contextShowPrompt } = useDialog();

  const showConfirm = (message) => contextShowConfirm('Xác nhận', message, 'warning');
  const showAlert = (message) => contextShowAlert('Thông báo', message, 'info');
  const showPrompt = (message) => contextShowPrompt('Nhập thông tin', message);

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
        // Ẩn Bản nháp (trangThai = 0) đối với các tài khoản không phải là Cơ sở CNNT tạo ra nó
        setData(list.filter(d => d.trangThai > 0));
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
    } catch { }
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
        contextShowAlert('Lỗi', "File Excel trống hoặc không đúng định dạng!", 'danger');
        return;
      }

      // Xử lý giá trị mặc định cho Lĩnh vực, Loại đề án, Đơn vị
      const defaultLinhVucId = linhVucs.length > 0 ? linhVucs[0].id : "00000000-0000-0000-0000-000000000000";
      // Lấy danh sách Loại đề án mặc định (nếu có thể)
      let defaultLoaiDeAnId = "00000000-0000-0000-0000-000000000000";
      try {
        const ldaRes = await api.get('/loaidean');
        if (ldaRes.data && ldaRes.data.length > 0) defaultLoaiDeAnId = ldaRes.data[0].id;
      } catch (e) { }

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

      contextShowAlert('Thành công', `Đã nhập thành công ${countSuccess}/${json.length} đề án từ Excel!`, 'success');
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      contextShowAlert('Lỗi', "Lỗi khi đọc file Excel: " + err.message, 'danger');
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
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Lỗi khi nộp hồ sơ.';
      await showAlert(msg);
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
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Lỗi khi duyệt hồ sơ.';
      await showAlert(msg);
    }
  };

  const handleModalTraVe = async () => {
    if (!rejectReason.trim()) {
      await showAlert('Vui lòng nhập lý do trả hồ sơ / nhận xét.');
      return;
    }
    try {
      await api.post(`/dean/${selectedItem.id}/tra-ve`, JSON.stringify({ lyDo: rejectReason, fileUrl: rejectFileUrl }), {
        headers: { 'Content-Type': 'application/json' }
      });
      await showAlert('Đã trả lại yêu cầu bổ sung.');
      setRejecting(false);
      setRejectReason('');
      setRejectFileUrl('');
      setSelectedItem(null);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      contextShowAlert('Lỗi', 'Lỗi khi trả lại hồ sơ.', 'danger');
    }
  };

  const handleRejectFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.fileUrl) {
        setRejectFileUrl(res.data.fileUrl);
      }
    } catch (error) {
      console.error('Lỗi tải file:', error);
      await showAlert('Không thể tải file lên server. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleActionFileUpload = async (e, type, item) => {
    const file = e.target.files[0];
    if (!file) return;

    let successMsg = null;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Backend trả về FileUrl (chữ F hoa) - tương thích cả 2 cách viết
      const fileUrl = res.data.FileUrl || res.data.fileUrl;
      if (!fileUrl) {
        throw new Error('Không nhận được đường dẫn file từ server. Vui lòng kiểm tra MinIO.');
      }

      if (type === 'ky-hop-dong') {
        await api.post(`/dean/${item.id}/ky-hop-dong`, JSON.stringify(fileUrl), {
          headers: { 'Content-Type': 'application/json' }
        });
        successMsg = '✅ Đã ký hợp đồng thành công!';
      } else if (type === 'nghiem-thu') {
        await api.post(`/dean/${item.id}/nghiem-thu`, JSON.stringify(fileUrl), {
          headers: { 'Content-Type': 'application/json' }
        });
        successMsg = '✅ Đã nghiệm thu đề án thành công!';
      }

      setRefreshTrigger(p => p + 1);
    } catch (error) {
      console.error('Lỗi tải file hoặc thao tác:', error);
      successMsg = '❌ ' + (error.response?.data?.Message || error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      // Đóng modal và dừng loading TRƯỚC, rồi mới show alert
      setIsUploading(false);
      if (e.target) e.target.value = '';
      setUploadModalData(null);
    }

    // Show alert SAU KHI modal đã đóng (ra ngoài try/finally để đảm bảo UI đã cập nhật)
    if (successMsg) {
      // setTimeout nhỏ để React có thời gian render lại (đóng modal) trước khi show alert
      setTimeout(() => showAlert(successMsg), 50);
    }
  };

  const handleKpiSubmit = async (kpiData) => {
    try {
      setIsUploading(true);
      await api.post(`/chitieukpi`, {
        deAnId: uploadModalData.item.id,
        thongKeHieuQua: kpiData
      });
      await showAlert('Đã lưu KPI hiệu quả thành công!');
      setUploadModalData(null);
    } catch (error) {
      console.error('Lỗi khi lưu KPI:', error);
      await showAlert('Lỗi khi lưu KPI. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTienDoSubmit = async (e, item) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('file');
    const phanTramHoanThanh = formData.get('phanTramHoanThanh');
    const ghiChuThucTe = formData.get('ghiChuThucTe');

    if (!file || file.size === 0) {
      await showAlert('Vui lòng đính kèm file báo cáo!');
      return;
    }

    let successMsg = null;
    try {
      setIsUploading(true);
      const fileData = new FormData();
      fileData.append('file', file);
      const res = await api.post('/file/upload', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data.FileUrl || res.data.fileUrl;
      if (!fileUrl) throw new Error('Upload file thất bại.');

      await api.post(`/tiendothuchien`, {
        deAnId: item.id,
        thangBaoCao: new Date().toISOString(),
        phanTramHoanThanh: Number(phanTramHoanThanh),
        ghiChuThucTe: ghiChuThucTe,
        fileBaoCaoUrl: JSON.stringify(fileUrl)
      });

      successMsg = '✅ Đã nộp báo cáo tiến độ thành công!';
      setRefreshTrigger(p => p + 1);
    } catch (error) {
      console.error('Lỗi báo cáo tiến độ:', error);
      successMsg = '❌ ' + (error.response?.data?.Message || error.response?.data?.message || error.message || 'Lỗi khi nộp báo cáo tiến độ');
    } finally {
      setIsUploading(false);
      setUploadModalData(null);
    }

    if (successMsg) {
      setTimeout(() => showAlert(successMsg), 50);
    }
  };

  const handleAppraisalApprove = async (item) => {
    try {
      await api.post(`/dean/${item.id}/duyet?currentTrangThai=${item.trangThai}`);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      await showAlert('Đã hoàn tất thẩm định và trình lên Bộ Công Thương!');
      setAppraisalModalOpen(false);
      setAppraisalItem(null);
      setSelectedItem(null); // Đóng luôn Modal Chi tiết
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi khi duyệt hồ sơ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAppraisalRequireEdit = (item) => {
    setAppraisalModalOpen(false);
    setSelectedItem(item);
    setRejecting(true);
  };

  const handleAppraisalReject = async (item) => {
    const lyDo = await showPrompt('Nhập lý do từ chối hồ sơ:');
    if (lyDo === null) return;
    if (!lyDo.trim()) {
      await showAlert('Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      await api.post(`/dean/${item.id}/tu-choi`, JSON.stringify(lyDo), {
        headers: { 'Content-Type': 'application/json' }
      });
      await showAlert('Đã từ chối hồ sơ thành công.');
      setAppraisalModalOpen(false);
      setAppraisalItem(null);
      setSelectedItem(null); // Đóng luôn Modal Chi tiết
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      await showAlert('Lỗi khi từ chối hồ sơ.');
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

          {/* Nút Xuất Báo Cáo TT34 */}
          {(isSo || isAdmin || isBo || isTTKC) && (
            <a
              href={`http://localhost:5030/api/baocao/export-tt34?year=${new Date().getFullYear()}`}
              className="btn-action-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#0f172a', padding: '6px 12px', borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: 600 }}
              target="_blank"
              rel="noreferrer"
            >
              <FileSpreadsheet size={15} />
              BÁO CÁO TT34
            </a>
          )}

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
                          onOpenUploadModal={(type, it) => setUploadModalData({ type, item: it })}
                          onOpenAppraisalModal={(it) => { setAppraisalItem(it); setAppraisalModalOpen(true); }}
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
              <button className="dmv2-close" onClick={() => setSelectedItem(null)}><X size={20} /></button>
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
                  <div className="dm-cell-value">
                    {selectedItem.nguonKinhPhi === 1 ? 'NS Trung ương' :
                      selectedItem.nguonKinhPhi === 2 ? 'NS Địa phương' :
                        selectedItem.nguonKinhPhi === 3 ? 'NS Kết hợp' :
                          selectedItem.nguonKinhPhi === 4 ? 'Khác' : '—'}
                  </div>
                </div>
                <div className="dm-card-cell">
                  <div className="dm-cell-label">ĐỊA ĐIỂM THỰC HIỆN</div>
                  <div className="dm-cell-value">{selectedItem.diaDiem || selectedItem.hoSoDinhKem?.diaDiemThucHien || selectedItem.diaChi || '—'}</div>
                </div>
              </div>

              {/* Ghi chú */}
              {selectedItem.ghiChu && (
                <div className="dm-grid-cards" style={{ marginTop: 0 }}>
                  <div className="dm-card-cell" style={{ gridColumn: '1 / -1' }}>
                    <div className="dm-cell-label">GHI CHÚ / LỊCH SỨ HỒ SƠ</div>
                    <div className="dm-cell-value" style={{ fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap' }}>
                      {selectedItem.ghiChu.split('|FILE|')[0]}
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin thực hiện & Giải ngân (chỉ hiện từ bước Phê duyệt) */}
              {selectedItem.trangThai >= 5 && (
                <div className="dm-grid-cards">
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐƠN VỊ THI CÔNG</div>
                    <div className="dm-cell-value">{selectedItem.tenDonViThiCong || selectedItem.donViThiCongText || selectedItem.hoSoDinhKem?.donViThiCong || '—'}</div>
                  </div>
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐƠN VỊ GIÁM SÁT</div>
                    <div className="dm-cell-value">{selectedItem.donViGiamSat || selectedItem.hoSoDinhKem?.donViGiamSat || '—'}</div>
                  </div>
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐÃ TẠM ỨNG</div>
                    <div className="dm-cell-value warn">{formatVND(selectedItem.kinhPhiTamUng || 0)}</div>
                  </div>
                  <div className="dm-card-cell">
                    <div className="dm-cell-label">ĐÃ QUYẾT TOÁN</div>
                    <div className="dm-cell-value success-green">{formatVND(selectedItem.kinhPhiQuyetToan || 0)}</div>
                  </div>
                </div>
              )}

              {/* Trạng thái hiện tại - Full width card như ảnh prototype */}
              <div className="dm-status-card">
                <span className="dm-status-label">Trạng thái hiện tại:</span>
                <span className="dm-status-badge"><StatusBadge status={selectedItem.trangThai} /></span>
              </div>

              {/* Box hiển thị Lý do trả về / Yêu cầu bổ sung */}
              {(selectedItem.trangThai === 3 || selectedItem.trangThai === 4) && selectedItem.ghiChu && (() => {
                const parts = selectedItem.ghiChu.split('|FILE|');
                const textReason = parts[0];
                const fileUrl = parts.length > 1 ? parts[1] : null;

                return (
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                    <h4 style={{ color: '#b91c1c', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={16} /> Lý do {selectedItem.trangThai === 3 ? 'Yêu cầu bổ sung hồ sơ' : 'Từ chối phê duyệt'}:
                    </h4>
                    <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                      {textReason}
                    </p>
                    {fileUrl && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #fca5a5' }}>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0369a1', textDecoration: 'none', backgroundColor: '#e0f2fe', padding: '6px 12px', borderRadius: '4px', fontWeight: 500 }}
                        >
                          <FileText size={14} /> Tải file đính kèm
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                      <span className="dm-cell-label" style={{ textTransform: 'none', fontSize: '13px', fontWeight: 700 }}>Tiến độ giải ngân (Tạm ứng + Quyết toán)</span>
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
                const showKyHopDong = (isCoSo || isTTKC || isSo || isBo || isAdmin) && item.trangThai === 5;
                const showNghiemThu = (isCoSo || isTTKC || isAdmin) && item.trangThai === 6;
                const showBaoCaoTienDo = (isCoSo || isTTKC || isAdmin) && item.trangThai === 6;
                const showQuyetToan = (isBo || isAdmin) && item.trangThai === 7;
                const showKPI = (isSo || isCoSo || isAdmin) && (item.trangThai >= 6);
                const hasActions = showNop || showDuyetSo || showDuyetBo || showKyHopDong || showNghiemThu || showQuyetToan || showKPI || showBaoCaoTienDo;
                const isTraVe = showDuyetSo || showDuyetBo;

                if (rejecting) return (
                  <div className="reject-form">
                    <h4 className="reject-title">Lý do yêu cầu bổ sung / Trả hồ sơ</h4>
                    <textarea className="reject-textarea" placeholder="Nhập chi tiết lý do, nhận xét để Cơ sở chỉnh sửa..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} />
                    <div className="reject-attachment">
                      <label className="reject-file-label" style={{ opacity: isUploading ? 0.5 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                        <input type="file" className="reject-file-input" onChange={handleRejectFileUpload} disabled={isUploading} />
                        <FileText size={14} /> {isUploading ? 'Đang tải file...' : rejectFileUrl ? 'Đã đính kèm file' : 'Đính kèm file (tùy chọn)'}
                      </label>
                      {rejectFileUrl && <span style={{ fontSize: '12px', color: '#16a34a', marginLeft: '8px' }}>✔ Đã tải lên</span>}
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
                        {item.trangThai === 6 && (isCoSo || isTTKC || isAdmin) ? (
                          <><CheckCircle size={14} /> Hồ sơ đang trong quá trình thực hiện. Vui lòng nộp ít nhất 1 Báo cáo tiến độ thi công để đủ điều kiện xin Nghiệm thu!</>
                        ) : hasActions ? (
                          <><CheckCircle size={14} /> Hồ sơ cần bạn xử lý ở bước này.</>
                        ) : (
                          <><Clock size={14} /> {item.trangThai >= 8 ? 'Đề án đã hoàn tất.' : 'Đang chờ cấp có thẩm quyền xử lý.'}</>
                        )}
                      </span>
                    </div>
                    <div className="detail-action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedItem(null)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155' }}
                      >
                        Đóng
                      </button>

                      {showNop && (
                        <button
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }}
                          onClick={handleModalNop}>
                          <CheckCircle size={15} /> Nộp hồ sơ
                        </button>
                      )}

                      {(showDuyetSo || showDuyetBo || showQuyetToan) && (
                        <button
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }}
                          onClick={() => {
                            if (showDuyetSo) {
                              setAppraisalItem(selectedItem);
                              setAppraisalModalOpen(true);
                            } else {
                              handleModalDuyet();
                            }
                          }}>
                          <CheckCircle size={15} /> {showDuyetSo ? 'Duyệt thẩm định' : 'Phê duyệt'}
                        </button>
                      )}

                      {showKyHopDong && (
                        <button
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669' }}
                          onClick={() => {
                            setUploadModalData({ type: 'ky-hop-dong', item: selectedItem });
                            setSelectedItem(null);
                          }}>
                          <CheckCircle size={15} /> Ký hợp đồng
                        </button>
                      )}

                      {showBaoCaoTienDo && (
                        <button
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }}
                          onClick={() => {
                            setUploadModalData({ type: 'bao-cao-tien-do', item: selectedItem });
                            setSelectedItem(null);
                          }}>
                          <FileText size={15} /> Báo cáo tiến độ
                        </button>
                      )}

                      {showNghiemThu && (
                        <button
                          disabled={selectedItem.soLuongBaoCaoTienDo === 0}
                          title={selectedItem.soLuongBaoCaoTienDo === 0 ? "Vui lòng nộp báo cáo tiến độ trước khi xin nghiệm thu" : ""}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
                            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb',
                            opacity: selectedItem.soLuongBaoCaoTienDo === 0 ? 0.5 : 1,
                            cursor: selectedItem.soLuongBaoCaoTienDo === 0 ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (selectedItem.soLuongBaoCaoTienDo === 0) return;
                            setUploadModalData({ type: 'nghiem-thu', item: selectedItem });
                            setSelectedItem(null);
                          }}>
                          <CheckCircle size={15} /> Nghiệm thu đề án
                        </button>
                      )}

                      {showKPI && (
                        <button
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', color: '#c026d3' }}
                          onClick={() => setUploadModalData({ type: 'kpi', item: selectedItem })}>
                          <TrendingUp size={15} /> Nhập KPI
                        </button>
                      )}

                      {isTraVe && (
                        <button
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                          onClick={() => setRejecting(true)}>
                          <XCircle size={15} /> Yêu cầu bổ sung
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

      {/* ── UPLOAD MODAL FOR KY HOP DONG / NGHIEM THU / KPI ── */}
      {uploadModalData && (
        <div className="reject-overlay" style={{ zIndex: 10000 }} onClick={() => setUploadModalData(null)}>
          <div className="reject-modal animate-popup" onClick={e => e.stopPropagation()}>
            <div className="rm-header">
              <div>
                <h3>
                  {uploadModalData.type === 'ky-hop-dong' ? '📄 Tải lên File Hợp đồng' :
                    uploadModalData.type === 'nghiem-thu' ? '✅ Tải lên Biên bản Nghiệm thu' :
                      uploadModalData.type === 'bao-cao-tien-do' ? '📊 Nộp Báo cáo tiến độ' : '📊 Cập nhật KPI Hiệu quả'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Đề án: <strong>{uploadModalData.item?.tenDeAn}</strong>
                </p>
              </div>
              <button onClick={() => setUploadModalData(null)}><X size={20} /></button>
            </div>
            <div className="rm-body">
              {uploadModalData.type === 'bao-cao-tien-do' ? (
                <div className="kpi-form">
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#475569' }}>
                    Vui lòng nhập phần trăm hoàn thành, ghi chú và đính kèm báo cáo tiến độ (PDF/DOC) có chữ ký.
                  </p>
                  <form onSubmit={(e) => handleTienDoSubmit(e, uploadModalData.item)}>
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Phần trăm hoàn thành (%)</label>
                        <input name="phanTramHoanThanh" type="number" min="0" max="100" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Ghi chú tiến độ thực tế</label>
                        <textarea name="ghiChuThucTe" rows="3" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Mô tả công việc đã hoàn thành..."></textarea>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Đính kèm File Báo cáo</label>
                        <input name="file" type="file" required accept=".pdf,.doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button type="submit" disabled={isUploading} className="btn-action-primary" style={{ backgroundColor: '#ea580c', border: 'none', padding: '10px 20px', borderRadius: '6px', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                        {isUploading ? 'Đang nộp báo cáo...' : 'Xác nhận Nộp'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : uploadModalData.type === 'kpi' ? (
                <div className="kpi-form">
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#475569' }}>
                    Vui lòng nhập các chỉ tiêu hiệu quả thực tế đạt được sau khi đề án hoàn thành.
                  </p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const kpiData = {
                      giaTriSanXuat: Number(formData.get('giaTriSanXuat')),
                      soMayMocMoi: Number(formData.get('soMayMocMoi')),
                      laoDongMoi: Number(formData.get('laoDongMoi')),
                      mucTangThuNhap: Number(formData.get('mucTangThuNhap')),
                      nopThue: Number(formData.get('nopThue')),
                    };
                    handleKpiSubmit(kpiData);
                  }}>
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Giá trị sản xuất (VNĐ)</label><input name="giaTriSanXuat" type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Số lượng máy móc mới</label><input name="soMayMocMoi" type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Lao động tạo mới/đào tạo</label><input name="laoDongMoi" type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Mức tăng thu nhập TB/tháng (VNĐ)</label><input name="mucTangThuNhap" type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Đóng góp NSNN / Nộp thuế (VNĐ)</label><input name="nopThue" type="number" required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button type="submit" disabled={isUploading} className="btn-action-primary" style={{ backgroundColor: '#10b981', border: 'none', padding: '10px 20px', borderRadius: '6px', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                        {isUploading ? 'Đang lưu...' : 'Lưu Chỉ Tiêu KPI'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Thông tin đề án */}
                  <div style={{ padding: '12px 16px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div><span style={{ color: '#64748b' }}>Mã đề án:</span> <strong>{uploadModalData.item?.maDeAn}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Kinh phí:</span> <strong style={{ color: '#1d4ed8' }}>{formatVND(uploadModalData.item?.kinhPhiDuKien)}</strong></div>
                      <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#64748b' }}>Đơn vị thụ hưởng:</span> <strong>{uploadModalData.item?.tenDonViThuHuong || '—'}</strong></div>
                    </div>
                  </div>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#475569' }}>
                    Vui lòng chọn file PDF bản scan có chữ ký và đóng dấu để hoàn tất thao tác này.
                  </p>
                  <div className="rm-upload-box" style={{ padding: '30px', textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <input
                      type="file"
                      onChange={(e) => handleActionFileUpload(e, uploadModalData.type, uploadModalData.item)}
                      disabled={isUploading}
                      id="actionFileInput"
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx"
                    />
                    <button
                      className="btn-upload"
                      onClick={() => document.getElementById('actionFileInput').click()}
                      disabled={isUploading}
                      style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                      {isUploading ? 'Đang xử lý tải lên...' : 'Chọn File PDF/DOC'}
                    </button>
                    <p style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>Hỗ trợ: PDF, DOC, DOCX (tối đa 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {appraisalModalOpen && (
        <DeAnAppraisalModal
          isOpen={appraisalModalOpen}
          item={appraisalItem}
          onClose={() => { setAppraisalModalOpen(false); setAppraisalItem(null); }}
          onApprove={handleAppraisalApprove}
          onReject={handleAppraisalReject}
          onRequireEdit={handleAppraisalRequireEdit}
        />
      )}

    </div>
  );
}

export default DeAnListPage;
