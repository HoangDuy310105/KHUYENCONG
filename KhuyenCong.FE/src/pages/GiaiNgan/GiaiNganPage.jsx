import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, CheckCircle, Clock, Plus, X, FileText, RefreshCw, Search, HelpCircle, Info, Download
} from 'lucide-react';
import api from '../../services/api';
import './GiaiNgan.css';

// ── FORMAT HELPERS ──────────────────────────────────────────────────────────
function formatVND(amount) {
  if (!amount && amount !== 0) return '—';
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2) + ' Tỷ';
  if (amount >= 1_000_000) return Math.round(amount / 1_000_000) + ' Triệu';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function formatVNDFull(amount) {
  if (!amount && amount !== 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── NGUON KINH PHI MAP ───────────────────────────────────────────────────────
const NGUON_KP_MAP = {
  1: { label: 'Trung ương', color: '#1d4ed8', bg: '#eff6ff' },
  2: { label: 'Địa phương', color: '#0369a1', bg: '#f0f9ff' },
  3: { label: 'Kết hợp', color: '#6d28d9', bg: '#f5f3ff' },
  4: { label: 'Khác', color: '#64748b', bg: '#f1f5f9' },
};

// ── STATUS MAP (đồng bộ với DeAn) ───────────────────────────────────────────
const TRANG_THAI_MAP = {
  5: { label: 'Đã Phê Duyệt', color: '#0369a1', bg: '#f0f9ff' },
  6: { label: 'Đang Thực Hiện', color: '#047857', bg: '#ecfdf5' },
  7: { label: 'Đã Nghiệm Thu', color: '#6d28d9', bg: '#f5f3ff' },
  8: { label: 'Đã Quyết Toán', color: '#374151', bg: '#f9fafb' },
};

// ── CUSTOM DIALOG ────────────────────────────────────────────────────────────
function GnDialog({ dialog, setDialog }) {
  if (!dialog.isOpen) return null;
  const close = () => setDialog({ ...dialog, isOpen: false });
  const handleConfirm = () => {
    if (dialog.onConfirm) dialog.onConfirm(true);
    close();
  };
  const handleCancel = () => {
    if (dialog.onConfirm) dialog.onConfirm(false);
    close();
  };
  return (
    <div className="custom-dialog-overlay animate-backdrop" style={{ zIndex: 11000 }}>
      <div className="custom-dialog-modal animate-popup">
        <div className="custom-dialog-body-flex">
          <div className="custom-dialog-icon-col">
            <div className={`custom-dialog-icon-circle ${dialog.type === 'alert' ? 'bg-blue' : 'bg-red'}`}>
              {dialog.type === 'alert' ? <Info size={24} strokeWidth={2.5} /> : <HelpCircle size={24} strokeWidth={2.5} />}
            </div>
          </div>
          <div className="custom-dialog-content-col">
            <h3 className="custom-dialog-title">{dialog.type === 'alert' ? 'Thông báo' : 'Xác nhận'}</h3>
            <p className="custom-dialog-message">{dialog.message}</p>
            <div className="custom-dialog-footer">
              {dialog.type !== 'alert' && (
                <button onClick={handleCancel} className="custom-dialog-btn btn-text-cancel">Bỏ qua</button>
              )}
              <button onClick={handleConfirm} className="custom-dialog-btn btn-red-confirm">
                {dialog.type === 'alert' ? 'Đóng' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GIẢI NGÂN MODAL ──────────────────────────────────────────────────────────
function GiaiNganModal({ deAn, lichSuGiaiNgan, onClose, onRefresh, showAlert, showConfirm }) {
  const [loai, setLoai] = useState('1');  // 1=TamUng, 2=QuyetToan
  const [soTien, setSoTien] = useState('');
  const [ngay, setNgay] = useState(new Date().toISOString().split('T')[0]);
  const [ghiChu, setGhiChu] = useState('');
  const [saving, setSaving] = useState(false);
  const userRole = localStorage.getItem('role') || '';
  const canEdit = ['Role_So', 'Role_Bo', 'Role_Admin', 'Role_TTKC', '2', '3', '4', '5'].includes(userRole);

  const tongTamUng = lichSuGiaiNgan.filter(g => g.loaiGiaiNgan === 1).reduce((s, g) => s + g.soTien, 0);
  const tongQuyetToan = lichSuGiaiNgan.filter(g => g.loaiGiaiNgan === 2).reduce((s, g) => s + g.soTien, 0);

  const handleSubmit = async () => {
    if (!soTien || isNaN(+soTien) || +soTien <= 0) {
      await showAlert('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    
    if (loai === '1') {
      const newTotal = tongTamUng + (+soTien);
      if (newTotal > deAn.kinhPhiDuKien) {
        const remaining = deAn.kinhPhiDuKien - tongTamUng;
        await showAlert(`Tổng số tiền tạm ứng vượt quá Kinh phí dự kiến! Bạn chỉ còn có thể giải ngân tối đa ${formatVNDFull(remaining)}.`);
        return;
      }
    } else {
      const newTotal = tongTamUng + (+soTien);
      if (newTotal > deAn.kinhPhiDuKien) {
        const remaining = deAn.kinhPhiDuKien - tongTamUng;
        await showAlert(`Tổng giải ngân vượt mức! Dự án đã tạm ứng ${formatVNDFull(tongTamUng)}, phần Quyết toán đợt cuối chỉ được tối đa ${formatVNDFull(remaining)}.`);
        return;
      }
    }

    const label = loai === '1' ? 'tạm ứng' : 'quyết toán';
    const ok = await showConfirm(`Xác nhận ghi nhận ${formatVNDFull(+soTien)} cho đợt ${label} đề án "${deAn.tenDeAn}"?`);
    if (!ok) return;

    setSaving(true);
    try {
      await api.post('/giai-ngan', {
        deAnId: deAn.id,
        loaiGiaiNgan: +loai,
        soTien: +soTien,
        ngayGiaiNgan: new Date(ngay).toISOString(),
        ghiChu: ghiChu || null,
      });
      await showAlert('Ghi nhận giải ngân thành công!');
      setSoTien(''); setGhiChu('');
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data?.message || err.message;
      await showAlert('Lỗi khi ghi nhận giải ngân: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const nguonKP = NGUON_KP_MAP[deAn.nguonKinhPhi] || NGUON_KP_MAP[2];
  const daQuyetToan = tongQuyetToan > 0;
  const tongDaChi = tongTamUng + tongQuyetToan;
  
  const tyLe = deAn.kinhPhiDuKien > 0
    ? Math.min(100, Math.round((tongDaChi / deAn.kinhPhiDuKien) * 100))
    : 0;

  return (
    <div className="gn-overlay animate-backdrop" onClick={onClose}>
      <div className="gn-modal animate-popup" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gn-modal-header">
          <div>
            <div className="gn-modal-badge" style={{ color: nguonKP.color, backgroundColor: nguonKP.bg }}>
              {nguonKP.label}
            </div>
            <h3 className="gn-modal-title">{deAn.tenDeAn}</h3>
            <div className="gn-modal-code">{deAn.maDeAn}</div>
          </div>
          <button className="gn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="gn-modal-body">
          {/* Tóm tắt tài chính */}
          <div className="gn-finance-summary">
            <div className="gn-finance-item">
              <div className="gn-finance-label">Kinh phí dự kiến</div>
              <div className="gn-finance-value primary">{formatVND(deAn.kinhPhiDuKien)}</div>
            </div>
            <div className="gn-finance-item">
              <div className="gn-finance-label">Đã tạm ứng</div>
              <div className="gn-finance-value orange">{formatVND(tongTamUng)}</div>
            </div>
            <div className="gn-finance-item">
              <div className="gn-finance-label">Đã quyết toán</div>
              <div className="gn-finance-value green">{formatVND(tongQuyetToan)}</div>
            </div>
            <div className="gn-finance-item">
              <div className="gn-finance-label">Tỷ lệ giải ngân</div>
              <div className="gn-finance-value navy">{tyLe}%</div>
            </div>
          </div>

          {/* Thanh progress */}
          <div className="gn-progress-wrap">
            <div className="gn-progress-track">
              {daQuyetToan ? (
                <div className="gn-progress-fill-quyet" style={{ width: `${tyLe}%` }} />
              ) : (
                <div className="gn-progress-fill-tam" style={{ width: `${tyLe}%` }} />
              )}
            </div>
            <div className="gn-progress-legend">
              {!daQuyetToan && <span><span className="dot orange" /> Đang Tạm ứng</span>}
              {daQuyetToan && <span><span className="dot green" /> Đã Quyết toán</span>}
            </div>
          </div>

          <div className="gn-modal-cols">
            {/* Lịch sử giải ngân */}
            <div className="gn-history">
              <h4 className="gn-section-title">Lịch sử giải ngân</h4>
              {lichSuGiaiNgan.length === 0 ? (
                <div className="gn-empty">Chưa có đợt giải ngân nào</div>
              ) : (
                <div className="gn-history-list">
                  {lichSuGiaiNgan.map(item => (
                    <div key={item.id} className="gn-history-item">
                      <div className={`gn-history-badge ${item.loaiGiaiNgan === 1 ? 'tam-ung' : 'quyet-toan'}`}>
                        {item.loaiGiaiNgan === 1 ? 'Tạm ứng' : 'Quyết toán'}
                      </div>
                      <div className="gn-history-amount">{formatVND(item.soTien)}</div>
                      <div className="gn-history-date">{formatDate(item.ngayGiaiNgan)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form ghi nhận */}
            {canEdit && (
              <div className="gn-form">
                <h4 className="gn-section-title">Ghi nhận đợt mới</h4>
                {daQuyetToan ? (
                  <div className="gn-settled-banner" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: '8px', color: '#475569', fontSize: '13px', textAlign: 'center' }}>
                    🔒 Dự án này đã được chốt Quyết toán. Không thể ghi nhận thêm giao dịch giải ngân mới.
                  </div>
                ) : (
                  <>
                    <div className="gn-form-group">
                      <label className="gn-label">Loại giải ngân</label>
                      <div className="gn-radio-group">
                        <label className={`gn-radio ${loai === '1' ? 'active' : ''}`}>
                          <input type="radio" value="1" checked={loai === '1'} onChange={e => setLoai(e.target.value)} />
                          <Clock size={14} /> Tạm ứng
                        </label>
                        <label className={`gn-radio ${loai === '2' ? 'active' : ''}`}>
                          <input type="radio" value="2" checked={loai === '2'} onChange={e => setLoai(e.target.value)} />
                          <CheckCircle size={14} /> Quyết toán
                        </label>
                      </div>
                      {loai === '1' && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Ghi chú: Bạn có thể tạm ứng nhiều đợt. Tổng tạm ứng không vượt quá Kinh phí dự kiến.</div>}
                      {loai === '2' && <div style={{ fontSize: '12px', color: '#ea580c', marginTop: '6px' }}>Lưu ý: Đây là bước chốt Giá trị cuối cùng. Sau khi lưu, bạn sẽ không thể tạm ứng thêm.</div>}
                    </div>
                    <div className="gn-form-group">
                      <label className="gn-label">Số tiền (VNĐ)</label>
                      <input
                        type="number"
                        className="gn-input"
                        placeholder="VD: 50000000"
                        value={soTien}
                        onChange={e => setSoTien(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="gn-form-group">
                      <label className="gn-label">Ngày giải ngân</label>
                      <input type="date" className="gn-input" value={ngay} onChange={e => setNgay(e.target.value)} />
                    </div>
                    <div className="gn-form-group">
                      <label className="gn-label">Ghi chú / Chứng từ</label>
                      <textarea className="gn-input" rows={3} placeholder="Số chứng từ, ghi chú..." value={ghiChu} onChange={e => setGhiChu(e.target.value)} />
                    </div>
                    <button className="gn-btn-submit" onClick={handleSubmit} disabled={saving}>
                      {saving ? 'Đang lưu...' : <><Plus size={14} /> Ghi nhận giải ngân</>}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function GiaiNganPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDeAn, setSelectedDeAn] = useState(null);
  const [lichSu, setLichSu] = useState([]);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const userRole = localStorage.getItem('role') || '';
  const canEdit = ['Role_So', 'Role_Bo', 'Role_Admin', 'Role_TTKC', '2', '3', '4', '5'].includes(userRole);

  const showAlert = msg => new Promise(resolve => setDialog({ isOpen: true, type: 'alert', message: msg, onConfirm: resolve }));
  const showConfirm = msg => new Promise(resolve => setDialog({ isOpen: true, type: 'confirm', message: msg, onConfirm: resolve }));

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/giai-ngan/summary');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu giải ngân:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/giai-ngan/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bang_Ke_Giai_Ngan_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      showAlert('Lỗi khi xuất file Excel. Vui lòng thử lại sau.');
    }
  };

  const openDetail = async (item) => {
    setSelectedDeAn(item);
    try {
      const res = await api.get(`/giai-ngan/dean/${item.id}`);
      setLichSu(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLichSu([]);
    }
  };

  const filtered = data.filter(d =>
    !search ||
    d.tenDeAn?.toLowerCase().includes(search.toLowerCase()) ||
    d.maDeAn?.toLowerCase().includes(search.toLowerCase())
  );

  // KPI tổng hợp
  const tongKinhPhi = filtered.reduce((s, d) => s + Number(d.kinhPhiDuKien || 0), 0);
  const tongTamUng = filtered.reduce((s, d) => s + Number(d.tongTamUng || 0), 0);
  const tongQuyetToan = filtered.reduce((s, d) => s + Number(d.tongQuyetToan || 0), 0);
  
  const tongDaChiToanBo = filtered.reduce((s, d) => s + Number(d.tongTamUng || 0) + Number(d.tongQuyetToan || 0), 0);
  const tyLeGiaiNgan = tongKinhPhi > 0 ? Math.round((tongDaChiToanBo / tongKinhPhi) * 100) : 0;

  return (
    <div className="gn-page">
      {/* Page Header */}
      <div className="gn-header">
        <div>
          <h1 className="gn-page-title">Kinh phí & Quyết toán</h1>
          <p className="gn-page-subtitle">Theo dõi giải ngân, tạm ứng và quyết toán các đề án khuyến công</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <button className="gn-btn-refresh" onClick={handleExportExcel} style={{ backgroundColor: '#10b981', color: 'white' }}>
              <Download size={14} /> Xuất Excel
            </button>
          )}
          <button className="gn-btn-refresh" onClick={() => setRefreshTrigger(p => p + 1)}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="gn-kpi-grid">
        <div className="gn-kpi-card navy">
          <div className="gn-kpi-icon"><DollarSign size={22} /></div>
          <div className="gn-kpi-body">
            <div className="gn-kpi-label">Tổng kinh phí dự kiến</div>
            <div className="gn-kpi-value">{formatVND(tongKinhPhi)}</div>
            <div className="gn-kpi-sub">{filtered.length} đề án đã được phê duyệt</div>
          </div>
        </div>
        <div className="gn-kpi-card orange">
          <div className="gn-kpi-icon"><Clock size={22} /></div>
          <div className="gn-kpi-body">
            <div className="gn-kpi-label">Tổng đã tạm ứng</div>
            <div className="gn-kpi-value">{formatVND(tongTamUng)}</div>
            <div className="gn-kpi-sub">Đang chờ thanh quyết toán</div>
          </div>
        </div>
        <div className="gn-kpi-card green">
          <div className="gn-kpi-icon"><CheckCircle size={22} /></div>
          <div className="gn-kpi-body">
            <div className="gn-kpi-label">Tổng đã quyết toán</div>
            <div className="gn-kpi-value">{formatVND(tongQuyetToan)}</div>
            <div className="gn-kpi-sub">Đã hoàn tất nghĩa vụ tài chính</div>
          </div>
        </div>
        <div className="gn-kpi-card purple">
          <div className="gn-kpi-icon"><TrendingUp size={22} /></div>
          <div className="gn-kpi-body">
            <div className="gn-kpi-label">Tỷ lệ giải ngân</div>
            <div className="gn-kpi-value">{tyLeGiaiNgan}%</div>
            <div className="gn-kpi-sub">
              <div className="gn-kpi-bar-wrap">
                <div className="gn-kpi-bar" style={{ width: `${tyLeGiaiNgan}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Panel */}
      <div className="gn-panel">
        <div className="gn-panel-header">
          <div className="gn-search-box">
            <Search size={14} className="gn-search-icon" />
            <input
              type="text" placeholder="Tìm tên, mã đề án..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="gn-search-input"
            />
          </div>
          <span className="gn-count">{filtered.length} đề án</span>
        </div>

        {loading ? (
          <div className="gn-loading"><div className="gn-spinner" /><span>Đang tải dữ liệu...</span></div>
        ) : filtered.length === 0 ? (
          <div className="gn-empty-page">
            <DollarSign size={48} style={{ opacity: 0.2 }} />
            <p>Chưa có đề án nào ở giai đoạn giải ngân</p>
          </div>
        ) : (
          <div className="gn-table-wrap">
            <table className="gn-table">
              <thead>
                <tr>
                  <th>MÃ & TÊN ĐỀ ÁN</th>
                  <th>ĐƠN VỊ THỤ HƯỞNG</th>
                  <th>NGUỒN KINH PHÍ</th>
                  <th className="th-right">KINH PHÍ DỰ KIẾN</th>
                  <th className="th-right">ĐÃ TẠM ỨNG</th>
                  <th className="th-right">ĐÃ QUYẾT TOÁN</th>
                  <th className="th-center">TIẾN ĐỘ</th>
                  <th className="th-center">TRẠNG THÁI</th>
                  <th className="th-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const nguon = NGUON_KP_MAP[item.nguonKinhPhi] || NGUON_KP_MAP[4];
                  const tt = TRANG_THAI_MAP[item.trangThai] || { label: 'Không rõ', color: '#64748b', bg: '#f1f5f9' };
                  const tyle = item.kinhPhiDuKien > 0
                    ? Math.min(100, Math.round(((item.tongTamUng + item.tongQuyetToan) / item.kinhPhiDuKien) * 100))
                    : 0;
                  const barColor = item.tongQuyetToan > 0 ? '#16a34a' : '#ea580c';
                  return (
                    <tr key={item.id} className="gn-row">
                      <td>
                        <div className="gn-td-code">{item.maDeAn}</div>
                        <div className="gn-td-name">{item.tenDeAn}</div>
                      </td>
                      <td className="gn-td-donvi">{item.tenDonViThuHuong || '—'}</td>
                      <td>
                        <span className="gn-nguon-badge" style={{ color: nguon.color, backgroundColor: nguon.bg }}>
                          {nguon.label}
                        </span>
                      </td>
                      <td className="td-right gn-amount-blue">{formatVND(item.kinhPhiDuKien)}</td>
                      <td className="td-right gn-amount-orange">{formatVND(item.tongTamUng)}</td>
                      <td className="td-right gn-amount-green">{formatVND(item.tongQuyetToan)}</td>
                      <td className="td-center">
                        <div className="gn-tyle-wrap">
                          <div className="gn-tyle-bar">
                            <div className="gn-tyle-fill" style={{ width: `${tyle}%`, backgroundColor: barColor }} />
                          </div>
                          <span className="gn-tyle-text">{tyle}%</span>
                        </div>
                      </td>
                      <td className="td-center">
                        <span className="gn-status-badge" style={{ color: tt.color, backgroundColor: tt.bg }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tt.color, display: 'inline-block', marginRight: 5 }} />
                          {tt.label}
                        </span>
                      </td>
                      <td className="td-center">
                        <button className="gn-btn-detail" onClick={() => openDetail(item)}>
                          <FileText size={13} /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi tiết */}
      {selectedDeAn && (
        <GiaiNganModal
          deAn={selectedDeAn}
          lichSuGiaiNgan={lichSu}
          onClose={() => { setSelectedDeAn(null); setLichSu([]); }}
          onRefresh={() => {
            setRefreshTrigger(p => p + 1);
            openDetail(selectedDeAn);
          }}
          showAlert={showAlert}
          showConfirm={showConfirm}
        />
      )}

      {/* Custom Dialog */}
      <GnDialog dialog={dialog} setDialog={setDialog} />
    </div>
  );
}
