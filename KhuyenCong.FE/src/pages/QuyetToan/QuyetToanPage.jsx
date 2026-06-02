import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import confetti from 'canvas-confetti';
import './QuyetToan.css';

const QuyetToanPage = () => {
  const { showAlert, showConfirm } = useDialog();
  const [deAns, setDeAns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CHUA_QUYET_TOAN, DA_QUYET_TOAN
  const [selectedDeAn, setSelectedDeAn] = useState(null);

  // Lấy Role để check quyền
  const roleKey = localStorage.getItem('role') || '4';
  const isAdminOrBo = roleKey === '3' || roleKey === '4';

  const fetchDeAns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dean?page=1&pageSize=100');
      // Chỉ lấy các Đề án đã được duyệt trở lên (TrangThai >= 5)
      const validDeAns = res.data.items.filter(d => d.trangThai >= 5).map(d => {
        if (d.hoSoDinhKem && typeof d.hoSoDinhKem === 'string') {
          try {
            d.hoSoDinhKem = JSON.parse(d.hoSoDinhKem);
          } catch (e) {
            console.error('Parse JSON hoSoDinhKem failed for', d.id);
          }
        }
        return d;
      });
      setDeAns(validDeAns);
    } catch (err) {
      console.error("Lỗi khi tải danh sách Đề án", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeAns();
  }, []);

  const handleQuyetToan = async (deAn) => {
    if (!isAdminOrBo) {
      showAlert("Cảnh báo", "Bạn không có quyền thực hiện thao tác này.", "danger");
      return;
    }
    
    if (deAn.trangThai === 8) {
      showAlert("Thông báo", "Đề án này đã được quyết toán rồi.", "info");
      return;
    }

    const isConfirmed = await showConfirm(
      "Xác nhận Quyết toán", 
      `Bạn có chắc chắn muốn ĐÓNG và QUYẾT TOÁN đề án "${deAn.tenDeAn}"?\nHành động này không thể hoàn tác.`,
      "warning"
    );

    if (isConfirmed) {
      try {
        await api.post(`/dean/${deAn.id}/quyet-toan`);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        showAlert("Thành công", "Đã quyết toán đề án thành công!", "success");
        fetchDeAns();
      } catch (err) {
        showAlert("Lỗi", "Lỗi khi quyết toán: " + (err.response?.data?.message || err.message), "danger");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 8: return <span className="status-badge status-closed">Đã Quyết toán</span>;
      case 7: return <span className="status-badge status-ready">Đã Nghiệm thu</span>;
      case 6: return <span className="status-badge status-progress">Đang Thực hiện</span>;
      default: return <span className="status-badge status-draft">Chưa Nghiệm thu</span>;
    }
  };

  const filteredDeAns = deAns.filter(d => {
    const matchSearch = d.tenDeAn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        d.maDeAn?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchStatus = true;
    if (statusFilter === 'DA_QUYET_TOAN') matchStatus = d.trangThai === 8;
    if (statusFilter === 'CHUA_QUYET_TOAN') matchStatus = d.trangThai < 8;

    return matchSearch && matchStatus;
  });

  return (
    <div className="qt-container">
      <div className="qt-header">
        <div>
          <h1 className="qt-title">Thanh lý & Quyết toán Dự án</h1>
          <p className="qt-subtitle">Quản lý hồ sơ nghiệm thu và đóng các đề án đã hoàn thành</p>
        </div>
        <div className="qt-actions">
          <div className="qt-search-box">
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm theo Tên hoặc Mã đề án..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="qt-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="CHUA_QUYET_TOAN">Chờ Quyết toán</option>
            <option value="DA_QUYET_TOAN">Đã Quyết toán</option>
          </select>
        </div>
      </div>

      <div className="qt-content">
        <div className="qt-table-wrapper custom-scrollbar">
          {loading ? (
            <div className="qt-loading">
              <i className="fa-solid fa-circle-notch fa-spin"></i> Đang tải dữ liệu...
            </div>
          ) : (
            <table className="qt-table">
              <thead>
                <tr>
                  <th>Mã ĐA</th>
                  <th style={{ width: '35%' }}>Tên Đề án</th>
                  <th>Kinh phí (VNĐ)</th>
                  <th>Đơn vị thụ hưởng</th>
                  <th>Trạng thái</th>
                  <th align="center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeAns.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="qt-empty">Không tìm thấy Đề án nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredDeAns.map(d => (
                    <tr key={d.id}>
                      <td className="font-semibold text-slate-700">{d.maDeAn || 'N/A'}</td>
                      <td style={{ cursor: 'pointer' }} onClick={() => setSelectedDeAn(d)}>
                        <div className="qt-project-name">{d.tenDeAn}</div>
                        <div className="qt-project-date">
                          {d.ngayNghiemThu ? `Nghiệm thu: ${new Date(d.ngayNghiemThu).toLocaleDateString('vi-VN')}` : (d.thoiGianKetThuc ? `Kết thúc: ${new Date(d.thoiGianKetThuc).toLocaleDateString('vi-VN')}` : 'Chưa có thông tin ngày')}
                        </div>
                      </td>
                      <td className="font-bold text-slate-800">
                        {d.kinhPhiDuKien?.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="text-sm font-medium text-slate-700">
                        {d.tenDonViThuHuong || 'N/A'}
                      </td>
                      <td>{getStatusBadge(d.trangThai)}</td>
                      <td align="center">
                        <button 
                          className={`btn-quyet-toan ${d.trangThai === 8 ? 'btn-disabled' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleQuyetToan(d); }}
                          disabled={d.trangThai === 8}
                          title={d.trangThai === 8 ? "Đã đóng" : "Tiến hành Quyết toán"}
                        >
                          {d.trangThai === 8 ? (
                            <><i className="fa-solid fa-lock"></i> Đã đóng</>
                          ) : (
                            <><i className="fa-solid fa-file-signature"></i> Quyết toán</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐỀ ÁN */}
      {selectedDeAn && (
        <div className="qt-modal-overlay" onClick={() => setSelectedDeAn(null)}>
          <div className="qt-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qt-modal-header">
              <h2>Chi tiết Đề án: {selectedDeAn.tenDeAn}</h2>
              <button className="qt-modal-close" onClick={() => setSelectedDeAn(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="qt-modal-body">
              <div className="qt-grid-2">
                <div className="qt-info-group">
                  <label>Mã Đề án</label>
                  <div>{selectedDeAn.maDeAn || '—'}</div>
                </div>
                <div className="qt-info-group">
                  <label>Lĩnh vực</label>
                  <div>{selectedDeAn.tenLinhVuc || '—'}</div>
                </div>
                <div className="qt-info-group">
                  <label>Đơn vị thụ hưởng</label>
                  <div className="font-bold text-blue-600">{selectedDeAn.tenDonViThuHuong || '—'}</div>
                </div>
                <div className="qt-info-group">
                  <label>Kinh phí dự kiến</label>
                  <div className="font-bold text-green-600">{selectedDeAn.kinhPhiDuKien?.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="qt-info-group">
                  <label>Đã Tạm ứng</label>
                  <div className="font-bold text-orange-500">{selectedDeAn.kinhPhiTamUng?.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="qt-info-group">
                  <label>Đã Quyết toán</label>
                  <div className="font-bold text-green-600">{selectedDeAn.kinhPhiQuyetToan?.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="qt-info-group">
                  <label>Đơn vị thi công</label>
                  <div>{selectedDeAn.tenDonViThiCong || selectedDeAn.donViThiCongText || selectedDeAn.hoSoDinhKem?.donViThiCong || '—'}</div>
                </div>
                <div className="qt-info-group">
                  <label>Đơn vị giám sát</label>
                  <div>{selectedDeAn.donViGiamSat || selectedDeAn.hoSoDinhKem?.donViGiamSat || '—'}</div>
                </div>
                <div className="qt-info-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Địa điểm thực hiện</label>
                  <div>{selectedDeAn.diaDiem || selectedDeAn.hoSoDinhKem?.diaDiemThucHien || selectedDeAn.diaChi || '—'}</div>
                </div>
              </div>
            </div>
            <div className="qt-modal-footer">
              <div className="qt-status-box">
                <span>Trạng thái hiện tại:</span>
                {getStatusBadge(selectedDeAn.trangThai)}
              </div>
              <button className="btn-close" onClick={() => setSelectedDeAn(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuyetToanPage;
