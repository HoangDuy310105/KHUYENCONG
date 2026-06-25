import { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, AlertCircle, Edit, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import './TienDoThucHienModal.css';

export default function TienDoThucHienModal({ isOpen, deAn, onClose, onRefreshDeAn }) {
  const { showAlert, showConfirm, showPrompt } = useDialog();
  const [baoCaos, setBaoCaos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const userRole = localStorage.getItem('role');
  const isCoSo = userRole === '1' || userRole === 'Role_CoSo';
  const isSo = userRole === '2' || userRole === 'Role_So';
  const isTTKC = userRole === '3' || userRole === 'Role_TTKC';
  const isAdmin = userRole === '99' || userRole === 'Role_Admin';

  const [mode, setMode] = useState('list'); // 'list', 'create', 'inspect', 'approve'
  const [selectedBaoCao, setSelectedBaoCao] = useState(null);
  
  // Create form state
  const [formData, setFormData] = useState({
    phanTramHoanThanh: '',
    ghiChuThucTe: '',
    file: null
  });

  // Inspect form state
  const [inspectData, setInspectData] = useState({
    phanTramThucTe: '',
    file: null
  });

  const loadData = async () => {
    if (!deAn?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/tiendothuchien/dean/${deAn.id}`);
      setBaoCaos(res.data.data || res.data);
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không thể tải danh sách tiến độ', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setMode('list');
    }
  }, [isOpen, deAn]);

  if (!isOpen) return null;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let fileUrl = '';
      if (formData.file) {
        const uploadData = new FormData();
        uploadData.append('file', formData.file);
        const uploadRes = await api.post('/file/upload', uploadData);
        fileUrl = JSON.stringify(uploadRes.data);
      }

      const payload = {
        deAnId: deAn.id,
        thangBaoCao: new Date().toISOString(),
        phanTramHoanThanh: Number(formData.phanTramHoanThanh),
        ghiChuThucTe: formData.ghiChuThucTe,
        fileBaoCaoUrl: fileUrl
      };

      await api.post('/tiendothuchien', payload);
      showAlert('Thành công', 'Đã nộp báo cáo tiến độ', 'success');
      setMode('list');
      loadData();
      if (onRefreshDeAn) onRefreshDeAn();
    } catch (error) {
      showAlert('Lỗi', 'Có lỗi xảy ra khi nộp', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let fileUrl = '';
      if (inspectData.file) {
        const uploadData = new FormData();
        uploadData.append('file', inspectData.file);
        const uploadRes = await api.post('/file/upload', uploadData);
        fileUrl = JSON.stringify(uploadRes.data);
      } else {
        showAlert('Cảnh báo', 'Bắt buộc phải đính kèm biên bản kiểm tra', 'warning');
        setLoading(false);
        return;
      }

      await api.put(`/tiendothuchien/${selectedBaoCao.id}/kiem-tra`, {
        phanTramThucTe: Number(inspectData.phanTramThucTe),
        bienBanKiemTraUrl: fileUrl
      });
      
      showAlert('Thành công', 'Cập nhật biên bản kiểm tra thành công', 'success');
      setMode('list');
      loadData();
    } catch (error) {
      showAlert('Lỗi', 'Có lỗi xảy ra', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (isApproved) => {
    if (!isApproved) {
      const lyDo = await showPrompt('Yêu cầu bổ sung', 'Nhập lý do yêu cầu bổ sung/từ chối:');
      if (!lyDo) return;
      await submitApprove(false, lyDo);
    } else {
      const confirmed = await showConfirm('Xác nhận', 'Bạn có chắc chắn muốn phê duyệt tiến độ này?');
      if (confirmed) {
        await submitApprove(true, null);
      }
    }
  };

  const submitApprove = async (isApproved, lyDo) => {
    try {
      setLoading(true);
      await api.put(`/tiendothuchien/${selectedBaoCao.id}/duyet`, {
        isApproved,
        lyDoTuChoi: lyDo
      });
      showAlert('Thành công', isApproved ? 'Đã phê duyệt' : 'Đã yêu cầu bổ sung', 'success');
      setMode('list');
      loadData();
      if (onRefreshDeAn) onRefreshDeAn();
    } catch (error) {
      showAlert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getTrangThaiBadge = (status) => {
    switch (status) {
      case 0: return <span className="badge badge-warning">⏳ Chờ kiểm tra</span>;
      case 1: return <span className="badge badge-danger">❌ Yêu cầu bổ sung</span>;
      case 2: return <span className="badge badge-success">✅ Đã phê duyệt</span>;
      default: return <span className="badge badge-secondary">Không rõ</span>;
    }
  };

  const parseFile = (jsonStr) => {
    if (!jsonStr) return null;
    try { return JSON.parse(jsonStr); } catch { return null; }
  };

  return (
    <div className="td-modal-overlay">
      <div className="td-modal-content">
        <div className="td-modal-header">
          <div>
            <h3>Tiến độ thực hiện Đề án</h3>
            <p>{deAn.tenDeAn}</p>
          </div>
          <button onClick={onClose} className="td-close-btn"><X size={20} /></button>
        </div>

        <div className="td-modal-body">
          {mode === 'list' && (
            <>
              <div className="td-actions-bar">
                {(isCoSo || isAdmin) && deAn.trangThai !== 7 && (
                  <button className="td-btn td-btn-primary" onClick={() => setMode('create')}>
                    + Báo cáo tiến độ mới
                  </button>
                )}
              </div>

              {loading ? <p>Đang tải...</p> : baoCaos.length === 0 ? <p className="td-empty">Chưa có báo cáo tiến độ nào.</p> : (
                <div className="td-list">
                  {baoCaos.map((bc, idx) => {
                    const fileBaoCao = parseFile(bc.fileBaoCaoUrl);
                    const fileKiemTra = parseFile(bc.bienBanKiemTraUrl);
                    
                    return (
                      <div key={bc.id} className="td-card">
                        <div className="td-card-header">
                          <span className="td-card-title">Lần {baoCaos.length - idx}: {new Date(bc.thangBaoCao).toLocaleDateString('vi-VN')}</span>
                          {getTrangThaiBadge(bc.trangThaiDuyet)}
                        </div>
                        
                        <div className="td-card-grid">
                          <div className="td-box">
                            <h4>Báo cáo của cơ sở</h4>
                            <p><strong>Hoàn thành:</strong> {bc.phanTramHoanThanh}%</p>
                            <p><strong>Ghi chú:</strong> {bc.ghiChuThucTe}</p>
                            {fileBaoCao && (
                              <a href={fileBaoCao.fileUrl || fileBaoCao.FileUrl || '#'} target="_blank" rel="noreferrer" className="td-link">
                                <FileText size={14} /> Xem báo cáo
                              </a>
                            )}
                          </div>
                          
                          <div className="td-box td-box-highlight">
                            <h4>Kiểm tra thực địa & Phê duyệt</h4>
                            {bc.phanTramThucTe !== null ? (
                              <>
                                <p><strong>Thực tế đạt:</strong> {bc.phanTramThucTe}%</p>
                                {fileKiemTra && (
                                  <a href={fileKiemTra.fileUrl || fileKiemTra.FileUrl || '#'} target="_blank" rel="noreferrer" className="td-link">
                                    <ShieldCheck size={14} /> Biên bản kiểm tra
                                  </a>
                                )}
                              </>
                            ) : (
                              <p className="td-muted">Chưa có biên bản kiểm tra</p>
                            )}
                            
                            {bc.trangThaiDuyet === 1 && bc.lyDoTuChoi && (
                              <div className="td-alert">
                                <AlertCircle size={14} /> <strong>Lý do:</strong> {bc.lyDoTuChoi}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Các nút hành động cho Sở / TTKC */}
                        <div className="td-card-actions">
                          {(isSo || isTTKC || isAdmin) && bc.trangThaiDuyet !== 2 && (
                             <button className="td-btn td-btn-outline" onClick={() => {
                               setSelectedBaoCao(bc);
                               setInspectData({ phanTramThucTe: bc.phanTramHoanThanh, file: null });
                               setMode('inspect');
                             }}>
                               <Edit size={14} /> Cập nhật BB Kiểm tra
                             </button>
                          )}
                          
                          {(isSo || isAdmin) && bc.trangThaiDuyet !== 2 && (
                            <>
                              <button className="td-btn td-btn-success" onClick={() => { setSelectedBaoCao(bc); handleApprove(true); }}>
                                <CheckCircle size={14} /> Phê duyệt
                              </button>
                              <button className="td-btn td-btn-danger" onClick={() => { setSelectedBaoCao(bc); handleApprove(false); }}>
                                <AlertCircle size={14} /> Yêu cầu bổ sung
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {mode === 'create' && (
            <form className="td-form" onSubmit={handleCreateSubmit}>
              <h4>Tạo Báo cáo tiến độ mới</h4>
              <div className="form-group">
                <label>Phần trăm hoàn thành (%)</label>
                <input type="number" required min="0" max="100" value={formData.phanTramHoanThanh} onChange={e => setFormData({...formData, phanTramHoanThanh: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Ghi chú thực tế</label>
                <textarea required rows="3" value={formData.ghiChuThucTe} onChange={e => setFormData({...formData, ghiChuThucTe: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Đính kèm File Báo cáo (PDF/DOC)</label>
                <input type="file" required accept=".pdf,.doc,.docx" onChange={e => setFormData({...formData, file: e.target.files[0]})} />
              </div>
              <div className="td-form-actions">
                <button type="button" className="td-btn td-btn-outline" onClick={() => setMode('list')}>Hủy</button>
                <button type="submit" className="td-btn td-btn-primary" disabled={loading}>{loading ? 'Đang gửi...' : 'Nộp báo cáo'}</button>
              </div>
            </form>
          )}

          {mode === 'inspect' && (
            <form className="td-form" onSubmit={handleInspectSubmit}>
              <h4>Cập nhật Biên bản Kiểm tra thực địa</h4>
              <p>Lần báo cáo: {new Date(selectedBaoCao?.thangBaoCao).toLocaleDateString('vi-VN')}</p>
              
              <div className="form-group">
                <label>Phần trăm hoàn thành THỰC TẾ (%)</label>
                <input type="number" required min="0" max="100" value={inspectData.phanTramThucTe} onChange={e => setInspectData({...inspectData, phanTramThucTe: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tải lên File Biên bản Giám sát/Kiểm tra (PDF - Bắt buộc)</label>
                <input type="file" required accept=".pdf,.doc,.docx" onChange={e => setInspectData({...inspectData, file: e.target.files[0]})} />
              </div>
              <div className="td-form-actions">
                <button type="button" className="td-btn td-btn-outline" onClick={() => setMode('list')}>Hủy</button>
                <button type="submit" className="td-btn td-btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu Biên bản'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
